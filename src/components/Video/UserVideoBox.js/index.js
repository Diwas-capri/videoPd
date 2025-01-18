import React, { useEffect, useRef, useState } from 'react';
import { Button, Typography, IconButton, Container, Paper, Box } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicOffIcon from '@mui/icons-material/MicOff';
import MicIcon from '@mui/icons-material/Mic';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos'; // Import the flip camera icon
import Peer from 'peerjs';
import OTPVerificationModal from '../../Otp';
import useSocket from '../../../hooks/useSocket';

const UserVideoBox = () => {
  const [confimJoin, setConfirmJoin] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [localStreamSend, setLocalStreamSend] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [tellAnswerClick, setTellAnswerClick] = useState(false);
  const [currentCamera, setCurrentCamera] = useState('user'); // State to manage camera (front/back)
  const {socket, connected} = useSocket();

  const urlParams = new URLSearchParams(window.location.search);
  const agentPeerId = urlParams.get('peerId');

  useEffect(() => {
    const peerInstance = new Peer();
    setPeer(peerInstance);

    peerInstance.on('open', (id) => {
      console.log('User Peer ID:', id);
    });

    peerInstance.on('disconnected', () => {
      console.warn('Peer disconnected. Attempting to reconnect...');
      peerInstance.reconnect();
    });

    peerInstance.on('close', () => {
      console.warn('Peer connection closed.');
    });

    peerInstance.on('error', (err) => {
      console.error('Peer connection error:', err);
    });

    startVideo();

    return () => {
      peerInstance.destroy();
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
          localVideoRef.current.muted = true;
        }
        setLocalStreamSend(stream);
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = false;
        }
        setLocalStream(stream);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm; codecs=vp8',
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket?.send && connected) {
            console.log('sending stream ', event.data);
            socket.send({userType: 'agent', stream: event.data}); 
          }
        };

        mediaRecorder.start(100); 
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  };
  
  const joinCall = () => {
    if (!agentPeerId) {
      alert('Agent Peer ID is missing. Ensure the correct link is used.');
      return;
    }
  
    // Call the agent using the local stream (video and audio)
    const outgoingCall = peer.call(agentPeerId, localStreamSend);
    setCall(outgoingCall);
  
    outgoingCall.on('stream', (remoteStream) => {
      // Display the remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play();
      }
    });
  
    outgoingCall.on('close', cleanup);
    outgoingCall.on('error', (error) => {
      console.error('Error in outgoing call:', error);
    });
  };

  const cleanup = () => {
    setCall(null);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const endCall = () => {
    if (call) call.close();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    cleanup();
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    // Toggle between front and back camera
    const newCamera = currentCamera === 'user' ? 'environment' : 'user';
    setCurrentCamera(newCamera);
  
    // Stop all current tracks (audio and video) before restarting the video
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  
    // Restart the video stream with the new camera
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: newCamera }, audio: true })
      .then((newStream) => {
        // Set the new stream
        setLocalStream(newStream);
  
        // Set the new stream to the local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
          localVideoRef.current.play();
        }
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  };
  const startRecording = () => {
    if (localStreamSend) {
  
      const mediaRecorder = new MediaRecorder(localStreamSend, { mimeType: 'video/webm; codecs=vp8' });
      mediaRecorderRef.current = mediaRecorder;
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
  
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        window.open(videoUrl, '_blank');
      };
  
      mediaRecorder.start();
      console.log('Recording started.');
    }
  };
  
  

  const stopRecording = () => {
    setRecordedChunks([]);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const tellAnswer = () => {
    setTellAnswerClick((prev) => !prev);
    if (!tellAnswerClick) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <Container
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper sx={{ width: '100%', padding: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" sx={{ marginBottom: 3 }}>
          User Video Screen
        </Typography>

        {/* Video Section */}
        <Box sx={{ position: 'relative', width: '100%', height: 'auto', backgroundColor: '#000', borderRadius: 8 }}>
          <video
            ref={localVideoRef}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 8,
            }}
            autoPlay
          />

          {/* Remote Video (Picture-in-Picture) */}
          <video
            ref={remoteVideoRef}
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              width: '20%',
              height: '20%',
              borderRadius: 8,
              border: '2px solid white',
            }}
            autoPlay
          />

          {/* Controls */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 70, // Just above the end call button
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            <IconButton
              onClick={toggleAudio}
              color={audioMuted ? 'secondary' : 'primary'}
              sx={{ fontSize: 32 }}
            >
              {audioMuted ? <MicOffIcon fontSize="large" /> : <MicIcon fontSize="large" />}
            </IconButton>
            <IconButton
              onClick={toggleVideo}
              color={videoMuted ? 'secondary' : 'primary'}
              sx={{ fontSize: 32 }}
            >
              {videoMuted ? <VideocamOffIcon fontSize="large" /> : <VideocamIcon fontSize="large" />}
            </IconButton>
          </Box>

          {/* Camera Flip Button */}
          <IconButton
            onClick={toggleCamera}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
            }}
          >
            <FlipCameraIosIcon fontSize="large" />
          </IconButton>

          {/* End Call Button */}
          {call && (
            <IconButton
              onClick={endCall}
              color="error"
              sx={{
                position: 'absolute',
                bottom: 10, // At the bottom of the video box
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#fff',
                '&:hover': {
                  backgroundColor: '#ff0000',
                },
              }}
            >
              <CallEndIcon fontSize="large" />
            </IconButton>
          )}
        </Box>

        {/* Join Call Button */}
        {!call && localStream ? (
          <Box
            sx={{
              width: '100%',
              textAlign: 'center',
              marginTop: 2,
            }}
          >
            <Button variant="contained" color="primary" onClick={joinCall}>
              Join Call
            </Button>
          </Box>
        ) : (
          <Box
          sx={{
            width: '100%',
            textAlign: 'center',
            marginTop: 2,
          }}
        >
          <Button variant="contained" color="primary" onClick={tellAnswer}>
            { tellAnswerClick ? 'Listining...' : 'Tell Answer'}
          </Button>
        </Box>
        )}
      </Paper>
      <OTPVerificationModal open={!confimJoin} setConfirmJoin={setConfirmJoin} />
    </Container>
  );
};

export default UserVideoBox;
