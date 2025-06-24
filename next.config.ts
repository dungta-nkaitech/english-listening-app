import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  images: {
    domains: ["ichef.bbc.co.uk"], // Cho phép ảnh từ BBC
  },
};

export default nextConfig;
