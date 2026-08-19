# Products in Malta — MCP Server

A standalone MCP (Model Context Protocol) server that exposes the admin panel to any MCP client (Claude Desktop, custom agents, etc.).

## Key properties
- **Persistent connection** — no expiry, no timeout
- **Token auth** — only super-admin generated tokens work
- **Direct DB access** — reads/writes the same Prisma database as the website
- **20+ tools** — full CRUD for products, blogs, categories, collections, banners, settings

## Setup

```bash
cd mcp-server
npm install
# Copy the same DATABASE_URL as the main app into MCP_SHARED_DB_URL in .env
npm start
```

Server runs on `http://localhost:4000/mcp` by default.

## Connect from Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "productsinmalta": {
      "url": "http://localhost:4000/mcp",
      "headers": { "Authorization": "Bearer YOUR_TOKEN_HERE" }
    }
  }
}
```

Get your token from Admin Panel → MCP Server (super-admin only).

## Available Tools

**Products:** `list_products`, `create_product`, `update_product`, `delete_product`, `search_products`
**Blogs:** `list_blogs`, `create_blog`, `update_blog`, `delete_blog`
**Categories:** `list_categories`, `create_category`, `create_subcategory`, `delete_category`
**Collections:** `list_collections`, `create_collection`, `add_product_to_collection`, `remove_product_from_collection`
**Banners:** `list_banners`, `create_banner`, `delete_banner`
**Settings:** `get_settings`, `update_setting`
**Stats:** `get_dashboard_stats`, `get_top_products`
