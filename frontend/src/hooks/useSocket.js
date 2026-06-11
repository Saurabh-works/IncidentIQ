import { useEffect } from "react";
import { io } from "socket.io-client";

export const socket = io(
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
  { autoConnect: true },
);

export function useSocket(event, callback) {
  useEffect(() => {
    socket.on(event, callback);
    return () => socket.off(event, callback);
  }, [event, callback]);
}
