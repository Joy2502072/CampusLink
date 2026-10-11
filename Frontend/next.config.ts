import type { NextConfig } from "next";

const CELL = process.env.CELL_API_URL ?? "http://localhost:5000";
const RECRUITER = process.env.RECRUITER_API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/api/cell/:path*", destination: `${CELL}/api/:path*` },
      { source: "/api/recruiter/:path*", destination: `${RECRUITER}/:path*` },
    ];
  },
};

export default nextConfig;
