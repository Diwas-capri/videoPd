const mediaRecorderHelper = (stream, socket) => {
  if (!stream || !socket) {
    console.error('Stream or socket is missing.');
    return null;
  }

  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm; codecs=vp8",
  });
  
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      socket.send(event.data);
    }
  };

  recorder.onstop = () => {
    socket.send(JSON.stringify({ userType: "agent", stop_stream: true }));
    console.log("Stream stopped and sent to the server.");
  };

  recorder.start(100);
  return recorder;
};

export default mediaRecorderHelper;
