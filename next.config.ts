import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/tools/lunch-savings",
        destination: "/lunch-savings",
        permanent: true,
      },
      {
        source: "/tools/lunch-savings/:path*",
        destination: "/lunch-savings",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
