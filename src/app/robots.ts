import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || "https://youroffers.eu";

  const privatePaths = [
    "/admin",
    "/admin/",
    "/admin/*",
    "/api",
    "/api/",
    "/api/*",
    "/api/affiliate/",
    "/oauth",
    "/oauth/",
    "/oauth/*",
    "/.well-known/",
    "/*?*sort=",
    "/*?*page=",
    "/mcp",
    "/mcp/",
    "/mcp/*"
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: privatePaths
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: privatePaths
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: privatePaths
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: privatePaths
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: privatePaths
      },
      {
        userAgent: "CCBot",
        disallow: "/"
      }
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base
  };
}
