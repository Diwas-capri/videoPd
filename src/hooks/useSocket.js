import { useEffect, useRef, useState } from "react";

const wsUrl = "ws://localhost:8765";

const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const [receiveEvent, setReceiveEvent] = useState({});
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

    // Handle incoming messages
    socket.onmessage = (event) => {
        try {
          const data = event.data ; // Parse the JSON here
          setReceiveEvent(data); // Set parsed data to ensure a new reference
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
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
  }, []);

  return { socket: socketRef.current, connected, receiveEventdata: receiveEvent };
};

export default useSocket;
