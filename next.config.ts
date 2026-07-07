import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Nonaktifkan optimasi Next.js untuk semua gambar eksternal
    // (Google user content, dll menolak request resize dari Next.js)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // Gambar dari backend lokal (upload produk)
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
