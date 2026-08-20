/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
    cpus: 1,
    workerThreads: false
  },
  webpack: (config) => {
    config.parallelism = 1;
    return config;
  }
};
module.exports = nextConfig;
