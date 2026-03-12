import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  /**
   * In development, proxy /api/* to the Flask server so CORS is not an issue.
   * In production on Vercel, the browser calls the Flask URL directly
   * (NEXT_PUBLIC_API_URL is a full URL, rewrites are skipped).
   */
  async rewrites() {
    // Only proxy to Flask when FLASK_PROXY=true is explicitly set.
    // Otherwise Next.js API routes in app/api/ handle all /api/* calls
    // (works on Vercel and local demo mode without Flask running).
    if (process.env.VERCEL || process.env.FLASK_PROXY !== "true") return [];
    return [
      {
        source: "/api/:path*",
        destination: `${API_BASE}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
