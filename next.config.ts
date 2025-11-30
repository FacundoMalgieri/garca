import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable strict mode for better error catching
  reactStrictMode: true,
  // Enable React Compiler (stable in Next.js 16 + React 19)
  reactCompiler: true,
  // Standalone output for Docker deployment
  output: "standalone",
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
