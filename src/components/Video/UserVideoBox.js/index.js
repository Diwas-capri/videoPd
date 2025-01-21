import React, { useEffect, useRef, useState } from 'react';
import { Button, Typography, IconButton, Container, Paper, Box } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicOffIcon from '@mui/icons-material/MicOff';
import MicIcon from '@mui/icons-material/Mic';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import Peer from 'peerjs';
import OTPVerificationModal from '../../Otp';
import MediaRecorder from "../../../helper/MediaRecorder";
import { useSocketContext } from '../../../context/SocketContext';
import mediaRecorderHelper from '../../../helper/MediaRecorder';

const UserVideoBox = () => {
  const [confimJoin, setConfirmJoin] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [tellAnswerClick, setTellAnswerClick] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [currentCamera, setCurrentCamera] = useState('user');
  const { socket, receiveEventdata } = useSocketContext();

  const urlParams = new URLSearchParams(window.location.search);
  const agentPeerId = urlParams.get('peerId');

  useEffect(() => {
      console.log('Receive message ', receiveEventdata);
    }, [receiveEventdata]);
  

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


    return () => {
      peerInstance.destroy();
    };
  }, []);

  useEffect(() => {
    if(confimJoin){
      startVideo();
    }
  }, [confimJoin])

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        mediaRecorderHelper(stream, socket);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
          localVideoRef.current.muted = true;
        }
        setLocalStream(stream);
        // MediaRecorder(stream, socket);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  };

  const joinCall = (currentStream) => {
    if (!agentPeerId) {
      alert('Agent Peer ID is missing. Ensure the correct link is used.');
      return;
    }

    // Call the agent using the local stream (video and audio)
    const outgoingCall = peer.call(agentPeerId, currentStream || localStream);
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
    // Remove video element bindings (if any)
    const videoElement = document.querySelector('video');
    if (videoElement) {
        videoElement.srcObject = null;
    }

    // Stop media stream
    if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
    }
    setCallEnded(true);
};

const endCall = () => {
    if (call) call.close();
    cleanup();
    setLocalStream(null);
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
      .getUserMedia({ video: { facingMode: newCamera }, audio: audioMuted })
      .then((newStream) => {
        // Set the new stream
        MediaRecorder(newStream, socket);
        setLocalStream(newStream);

        // Set the new stream to the local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
          localVideoRef.current.play();
        }
        joinCall(newStream);
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  };
  const startRecording = () => {
    if (localStream) {

      const mediaRecorder = new MediaRecorder(localStream, { mimeType: 'video/webm; codecs=vp8' });
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
    setTellAnswerClick((prev) => {
      return !prev
    });
  };
  if (callEnded) {
    return (
      <Paper
        elevation={3}
        style={{
          padding: '20px',
          textAlign: 'center',
          maxWidth: '400px',
          margin: '50px auto',
          backgroundColor: '#f0f8ff',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            style={{
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#2e7d32',
            }}
          >
            Thank You for Joining!
          </Typography>
        </Box>
      </Paper>
    )
  }
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
            <Button variant="contained" color="primary" onClick={() => joinCall(false)}>
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
            {/* <Button variant="contained" color="primary" onClick={tellAnswer}>
            { tellAnswerClick ? 'Listining...' : ''}
          </Button> */}
          </Box>
        )}
      </Paper>
      <OTPVerificationModal open={!confimJoin} setConfirmJoin={setConfirmJoin} />
    </Container>
  );
};

export default UserVideoBox;
