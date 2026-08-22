/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
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
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }
        ]
      },
      {
        source: "/admin",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }
        ]
      },
      {
        source: "/oauth/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }
        ]
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }
        ]
      },
      {
        source: "/mcp/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/products",
        has: [{ type: "query", key: "category", value: "(?<slug>[^&]+)" }],
        destination: "/category/:slug",
        permanent: true
      },
      {
        source: "/products",
        has: [{ type: "query", key: "collection", value: "(?<slug>[^&]+)" }],
        destination: "/collection/:slug",
        permanent: true
      }
    ];
  }
};
module.exports = nextConfig;
