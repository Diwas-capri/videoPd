import React, { useEffect, useRef, useState } from "react";
import {
  Typography,
  IconButton,
  Box,
  Button,
  Grid2,
  Paper,
  Container,
  Tooltip,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CallEndIcon from "@mui/icons-material/CallEnd";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Peer from "peerjs";
import AlertDialog from "../../dialog";
import useSocket from "../../../hooks/useSocket";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


const AgentVideoBox = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [call, setCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [localStreamSend, setLocalStreamSend] = useState(null);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [imageCaptured, setImageCaptured] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState("");
  const {socket, connected} = useSocket();

  useEffect(() => {
    const peerInstance = new Peer("1234");
    setPeer(peerInstance);

    peerInstance.on("open", (id) => {
      console.log("Peer ID srart:", id);
      setPeerId(id);
    });

    peerInstance.on("call", (incomingCall) => {
      if (!localStream) return;

      incomingCall.answer(localStreamSend);
      setCall(incomingCall);

      incomingCall.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        }
      });

      incomingCall.on("close", cleanup);
    });

    return () => {
      peerInstance.destroy();
    };
  }, [localStream]);

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
  
  useEffect(() => {
    startVideo();
  }, []);

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
      videoTrack.enabled = !videoTrack.enabled;
      setVideoMuted(!videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioMuted(!audioTrack.enabled);
    }
  };

  const captureImage = () => {
    if (remoteVideoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = remoteVideoRef.current.videoWidth;
      canvas.height = remoteVideoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(remoteVideoRef.current, 0, 0);
      setImageCaptured((prev) => [...prev, { key: selectedOption, image: canvas.toDataURL("image/png") }]);
      setOpen(false);
      setSelectedOption("");
    }
  };

  console.log('peer id ', peerId);

  return (
    <Container maxWidth="lg" sx={{ height: '800px', margin: 'auto', display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Title */}
      <Typography variant="h4" align="center">
        Agent Video Screen
      </Typography>

      {/* Controls and Copy Button */}
      <Grid2 container spacing={2} justifyContent="center" alignItems="center">
        <Grid2 item>
          <IconButton onClick={toggleVideo} color={videoMuted ? "secondary" : "primary"}>
            {videoMuted ? <VideocamOffIcon /> : <VideocamIcon />}
          </IconButton>
        </Grid2>
        <Grid2 item>
          <IconButton onClick={toggleAudio} color={audioMuted ? "secondary" : "primary"}>
            {audioMuted ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Grid2>
        <Grid2 item>
          <IconButton onClick={endCall} color="error">
            <CallEndIcon />
          </IconButton>
        </Grid2>
        <Grid2 item>
          {peerId && (
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                navigator.clipboard.writeText(`${window?.location}user?peerId=${peerId}`)
              }
            >
              Copy Video Link
            </Button>
          )}
        </Grid2>
      </Grid2>

      {/* Video Screen */}
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/9", backgroundColor: "#000", borderRadius: 2 }}>
        <video
          ref={remoteVideoRef}
          style={{ width: "100%", height: "500px", borderRadius: "8px" }}
          autoPlay
        />
        <video
          ref={localVideoRef}
          style={{
             width: "20%",
             height: "20%",
             borderRadius: "8px",
             position: "absolute",
             top: 8,
             left: 1,
           }}
          autoPlay
        />
        <Tooltip title="Capture Image">
          <IconButton
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "#fff",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.8)",
              },
            }}
            onClick={() => setOpen(true)}
          // onClick={captureImage}
          >
            <CameraAltIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Gallery */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {imageCaptured.map((src, index) => (
          <Paper
            key={index}
            elevation={3}
            sx={{
              position: "relative",
              width: 100,
              height: 100, // Adjusted to fit only the image
              overflow: "hidden",
            }}
          >
            {/* Remove Button */}
            <IconButton
              onClick={() =>
                setImageCaptured((prev) => prev.filter((_, i) => i !== index))
              }
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
              }}
              size="small"
            >
              ✕
            </IconButton>

            {/* Image */}
            <img
              src={src.image}
              alt={`Captured ${index}`}
              style={{ width: "100%", height: "100%" }}
            />

            {/* Key at the bottom */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                textAlign: "center",
                padding: "2px 0",
                fontSize: "12px",
              }}
            >
              {src.key}
            </Box>
          </Paper>
        ))}
      </Box>


      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Select capture image option
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="capture-option-label">Select Option</InputLabel>
            <Select
              labelId="capture-option-label"
              value={selectedOption}
              label="Select Option"
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <MenuItem value="west boundry Image">west boundry Image</MenuItem>
              <MenuItem value="west boundry Image">west boundry Image</MenuItem>
              <MenuItem value="North boundry Image">North boundry Image</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={captureImage}
            sx={{ mt: 2, width: "100%" }}
          >
            Capture Image
          </Button>
        </Box>
      </Modal>

    </Container>
  );
};

export default AgentVideoBox;
