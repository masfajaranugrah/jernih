import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getChatSocket(token?: string): Socket {
  if (socket && (socket.connected || socket.active)) return socket;

  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api")
    .replace(/\/api\/?$/, "");

  socket = io(base, {
    withCredentials: true,
    auth: token ? { token } : undefined,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    path: "/api/socket.io",
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connection error:", err.message);
    // Stop reconnect jika token expired — redirect ke login
    if (err.message === "jwt expired" || err.message === "invalid token") {
      socket?.disconnect();
      window.location.href = "/dashboard/pelanggan/login";
    }
  });

  return socket;
}

export function closeChatSocket() {
  socket?.disconnect();
  socket = null;
}
