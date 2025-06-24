import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
  images: {
    domains: ["ichef.bbc.co.uk"],
  },
};

const config = withPWA({
  dest: "public",
  register: true,
  // skipWaiting: false để tránh reload loop
  disable: process.env.NODE_ENV === "development", // bật PWA ở production
})(nextConfig);

export default config;
