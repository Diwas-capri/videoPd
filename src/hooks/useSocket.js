import { useEffect, useRef, useState } from "react";

const wsUrl = "ws://00da-203-122-25-66.ngrok-free.app";

const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    // Handle connection open
    socket.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };

    // Handle errors
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Handle connection close
    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };
    // Cleanup WebSocket on unmount
    return () => {
      socket.close();
    };
  }, [wsUrl]);

  return { socket: socketRef.current, connected };
};

export default useSocket;
