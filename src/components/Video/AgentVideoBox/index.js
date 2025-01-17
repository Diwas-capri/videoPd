import React, { useEffect, useRef, useState } from 'react';
import { Typography, IconButton, Container, Paper, Box, Button } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import Peer from 'peerjs';

const AgentVideoBox = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [call, setCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    // Initialize PeerJS
    const peerInstance = new Peer('1234');
    setPeer(peerInstance);

    peerInstance.on('open', id => {
      console.log('Agent Peer ID:', id);
      setPeerId(id);
    });

    peerInstance.on('call', incomingCall => {
      console.log('Incoming call:', incomingCall);
      if (!localStream) {
        console.warn('Local stream not available to answer call.');
        return;
      }

      incomingCall.answer(localStream);
      setCall(incomingCall);

      incomingCall.on('stream', remoteStream => {
        console.log('Remote stream received:', remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        }
      });

      incomingCall.on('close', () => {
        console.log('Call ended.');
        cleanup();
      });

      incomingCall.on('error', error => {
        console.error('Error in incoming call:', error);
      });
    });

    

    return () => {
      peerInstance.destroy();
    };
  }, [localStream]);

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

  useEffect(() => {
    startVideo();
  },[])

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

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {peerId && <Button onClick={() => navigator.clipboard.writeText(`${window?.location}user?peerId=${peerId}`)}>Copy link</Button>}
      <Paper sx={{ width: '100%', padding: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" sx={{ marginBottom: 3 }}>
          Agent Video Screen
        </Typography>
        <Box sx={{ marginBottom: 3 }}>
          {localStream && (
            <IconButton onClick={endCall} color="error" sx={{ marginTop: 3 }}>
              <CallEndIcon />
            </IconButton>
          )}
        </Box>
        <video 
          ref={remoteVideoRef} 
          style={{ width: '100%', height: 'auto', backgroundColor: '#000', borderRadius: 8 }} 
          autoPlay 
          muted 
        />
        <video 
          ref={localVideoRef} 
          style={{ marginTop: '20px', width: '100%', height: 'auto', backgroundColor: '#000', borderRadius: 8 }} 
          autoPlay 
        />
      </Paper>
    </Container>
  );
};

export default AgentVideoBox;