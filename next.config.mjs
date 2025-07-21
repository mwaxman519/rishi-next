import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ultra minimal config - let Next.js handle everything
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  serverExternalPackages: ['@neondatabase/serverless'],
  experimental: { forceSwcTransforms: true },
};

export default nextConfig;