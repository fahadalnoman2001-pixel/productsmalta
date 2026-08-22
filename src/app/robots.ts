import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || "https://youroffers.eu";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api",
          "/api/",
          "/api/affiliate/", // block affiliate redirect URLs from indexing
          "/oauth",
          "/.well-known/",
          "/*?*sort=", // block sort/filter parameter combinations
          "/*?*page=",
          "/mcp",
          "/mcp/"
        ]
      },
      {
        userAgent: "GPTBot",
        allow: "/" // let ChatGPT crawl for citations
      },
      {
        userAgent: "PerplexityBot",
        allow: "/"
      },
      {
        userAgent: "Google-Extended",
        allow: "/" // opt in to Google AI Overviews
      },
      {
        userAgent: "ClaudeBot",
        allow: "/"
      },
      {
        userAgent: "anthropic-ai",
        allow: "/"
      },
      {
        userAgent: "CCBot",
        disallow: "/" // block Common Crawl bulk scrapers
      }
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base
  };
}
