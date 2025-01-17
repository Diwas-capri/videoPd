import React, { useEffect, useRef, useState } from 'react';
import { Button, Typography, IconButton, Container, Paper, Box } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicOffIcon from '@mui/icons-material/MicOff';
import MicIcon from '@mui/icons-material/Mic';
import Peer from 'peerjs';

const UserVideoBox = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  // Extract agentPeerId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const agentPeerId = urlParams.get('peerId');

  useEffect(() => {
    // Initialize PeerJS
    const peerInstance = new Peer();
    setPeer(peerInstance);

    peerInstance.on('open', id => {
      console.log('User Peer ID:', id);
    });

    peerInstance.on('disconnected', () => {
      console.warn('Peer disconnected. Attempting to reconnect...');
      peerInstance.reconnect();
    });

    peerInstance.on('close', () => {
      console.warn('Peer connection closed.');
    });

    peerInstance.on('error', err => {
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
      .then(stream => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }
        setLocalStream(stream);
      })
      .catch(error => console.error('Error accessing media devices:', error));
  };

  const joinCall = () => {
    if (!agentPeerId) {
      alert('Agent Peer ID is missing. Ensure the correct link is used.');
      return;
    }

    const outgoingCall = peer.call(agentPeerId, localStream);
    setCall(outgoingCall);
    console.log('Outgoing call:', agentPeerId, outgoingCall);

    outgoingCall.on('stream', remoteStream => {
      console.log('Remote stream received:', remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play();
      }
    });

    outgoingCall.on('close', () => {
      console.log('Call ended.');
      cleanup();
    });

    outgoingCall.on('error', error => {
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
      localStream.getTracks().forEach(track => track.stop());
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

  return (
    <Container sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ width: '100%', padding: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" sx={{ marginBottom: 3 }}>
          User Video Screen
        </Typography>

        {/* Video Section */}
        <Box sx={{ position: 'relative' }}>
          <video 
            ref={localVideoRef} 
            style={{ width: '100%', height: 'auto', backgroundColor: '#000', borderRadius: 8 }} 
            autoPlay 
            muted 
          />
          <Box sx={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            justifyContent: 'center',
            gap: 3
          }}>
            <IconButton onClick={toggleAudio} color={audioMuted ? 'secondary' : 'primary'}>
              {audioMuted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            <IconButton onClick={toggleVideo} color={videoMuted ? 'secondary' : 'primary'}>
              {videoMuted ? <VideocamOffIcon /> : <VideocamIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Bottom Center Buttons */}
        <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: '100%', textAlign: 'center' }}>
          {localStream && !call && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={joinCall} 
              sx={{ width: '200px' }}
            >
              Join Call
            </Button>
          )}
          {call && (
            <IconButton onClick={endCall} color="error" sx={{ marginTop: 3 }}>
              <CallEndIcon />
            </IconButton>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default UserVideoBox;
