import type { NextConfig } from "next";

// HTTP keep-alive agent — reuse koneksi ke backend, kurangi TCP handshake overhead
// Ini signifikan saat Next.js server action/server component fetch ke NestJS
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "http", hostname: "localhost", port: "3001", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "3001", pathname: "/uploads/**" },
      { protocol: "https", hostname: "api.jernihcreatif.com", pathname: "/uploads/**" },
    ],
  },

  // Compress response otomatis
  compress: true,

  // Header keamanan + performa
  async headers() {
    return [
      {
        source: "/dashboard-admin/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No cache untuk halaman admin — selalu fresh
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      // _next/static headers dihapus — Next.js mengelola ini sendiri
    ];
  },
};

// Aktifkan HTTP keep-alive untuk semua fetch dari Next.js server ke backend
// Tanpa ini: setiap server action buka koneksi TCP baru = +50-200ms per request
if (typeof globalThis !== "undefined") {
  const { Agent: HttpAgent } = require("http");
  const { Agent: HttpsAgent } = require("https");

  const httpAgent = new HttpAgent({ keepAlive: true, maxSockets: 50 });
  const httpsAgent = new HttpsAgent({ keepAlive: true, maxSockets: 50 });

  const originalFetch = globalThis.fetch;
  // Hanya override jika belum di-patch
  if (originalFetch && !(originalFetch as any).__keepAlive) {
    const patchedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))) {
        const agent = url.startsWith("https://") ? httpsAgent : httpAgent;
        return originalFetch(input, { ...(init ?? {}), ...({ agent } as any) });
      }
      return originalFetch(input, init);
    };
    (patchedFetch as any).__keepAlive = true;
    globalThis.fetch = patchedFetch as typeof fetch;
  }
}

export default nextConfig;
