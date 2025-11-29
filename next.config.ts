import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Prisma works correctly with Next.js
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
