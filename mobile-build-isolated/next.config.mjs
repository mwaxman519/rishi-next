/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    VOLTBUILDER_BUILD: 'true'
  },
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
