import type { NextConfig } from "next";

// HTTP keep-alive agent — reuse koneksi ke backend, kurangi TCP handshake overhead
// Ini signifikan saat Next.js server action/server component fetch ke NestJS
const nextConfig: NextConfig = {
  devIndicators: false,
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

  // Proxy /uploads ke backend — gunakan /api/uploads agar Nginx bisa proxy ke NestJS
  async rewrites() {
    const backendBase = (process.env.API_URL ?? "http://localhost:3001/api").replace(/\/api$/, "");
    return [
      {
        source: "/uploads/:path*",
        destination: `${backendBase}/api/uploads/:path*`,
      },
    ];
  },

  // Header keamanan + performa
  async headers() {
    // Ambil backend host dari API_URL untuk CSP img-src
    const apiUrl = process.env.API_URL ?? "http://localhost:3001/api";
    const backendOrigin = apiUrl.replace(/\/api$/, "");

    // Content Security Policy — batasi sumber resource yang diizinkan browser
    const cspDirectives = [
      "default-src 'self'",
      // Script: self + inline (Next.js hydration) + eval (beberapa library) + Midtrans Snap
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com",
      // Style: self + inline (Tailwind, komponen styled)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Font
      "font-src 'self' https://fonts.gstatic.com data:",
      // Gambar: self + data URI + backend uploads + Google avatar + Midtrans
      `img-src 'self' data: blob: ${backendOrigin} https://lh3.googleusercontent.com https://*.midtrans.com`,
      // Koneksi API + WebSocket ke backend + Midtrans API
      `connect-src 'self' ${backendOrigin} ${backendOrigin.replace(/^http/, "ws")} ${backendOrigin.replace(/^http/, "wss")} https://app.sandbox.midtrans.com https://app.midtrans.com`,
      // Frame: izinkan iframe Midtrans Snap popup
      "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com",
      // Object: tolak semua (cegah plugin flash / PDF inject)
      "object-src 'none'",
      // Base URI: hanya self
      "base-uri 'self'",
      // Form: hanya kirim ke self
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/dashboard-admin/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: cspDirectives },
          // No cache untuk halaman admin — selalu fresh
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: cspDirectives },
        ],
      },
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
