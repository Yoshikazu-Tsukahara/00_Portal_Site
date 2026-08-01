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
  async headers() {
    /**
     * SW は /app/sw.js に置くと既定の最大スコープが /app/ になり、
     * Next.js 既定の URL（末尾スラッシュ無し /app）を制御できない。
     * Service-Worker-Allowed で /app スコープ登録を許可し、BIP を発火させる。
     */
    const swAllowed = [
      { key: "Service-Worker-Allowed", value: "/" },
      { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
    ];
    return [
      { source: "/sw.js", headers: swAllowed },
      { source: "/:path*/sw.js", headers: swAllowed },
    ];
  },
};

export default nextConfig;
