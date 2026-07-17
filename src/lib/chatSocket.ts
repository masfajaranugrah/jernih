import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Singleton koneksi socket ke backend, persisten selama sesi aplikasi.
 * - Pelanggan: cookie mh_token ikut terkirim (withCredentials) + token sebagai fallback.
 * - Admin: token dari getToken() sebagai fallback auth.
 *
 * Koneksi TIDAK diputus saat komponen chat unmount — provider notifikasi global
 * tetap butuh dengar pesan masuk di halaman lain. Tiap komponen cukup melepas
 * listener-nya sendiri (socket.off) di cleanup. Panggil closeChatSocket() hanya
 * saat logout.
 */
export function getChatSocket(token?: string): Socket {
  if (socket && (socket.connected || socket.active)) return socket;

  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api")
    .replace(/\/api\/?$/, "");

  socket = io(base, {
    withCredentials: true,
    auth: token ? { token } : undefined,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
  return socket;
}

export function closeChatSocket() {
  socket?.disconnect();
  socket = null;
}
