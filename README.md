# Products in Malta — Affiliate Marketing Platform

Full-stack affiliate marketing website + admin panel + MCP server for **productsinmalta.com**.

## What's Inside

- **Next.js 14 website** — Homepage, All Products, Product Detail, Blog, Blog Detail, About, Contact, Privacy, Terms, auto sitemap & robots
- **Admin Panel** at `/admin` — Dashboard, Products CRUD, Categories, Collections, Blogs, Banners, Settings, MCP Server management
- **MCP Server** — Standalone Node.js MCP server (`mcp-server/`) with 22 tools, persistent connection, super-admin-only access
- **Auth** — NextAuth with role-based access (super_admin, admin, editor)
- **SEO** — Server-side rendering, schema.org, OpenGraph, sitemap, robots.txt, GSC / GA4 / Meta Pixel injection
- **Analytics** — Affiliate click tracking, dashboard stats

## Quick Start

Prereqs: Node.js 18+ and npm.

```bash
# 1) Install & set up the main app
cd productsinmalta
cp .env.example .env
# (Edit .env — set NEXTAUTH_SECRET to a random string)

npm install
npx prisma generate
npx prisma db push
npm run db:seed        # creates admin user, categories, sample products, blogs, banners, MCP token

npm run dev            # → http://localhost:3000
```

Open http://localhost:3000 for the site.
Open http://localhost:3000/admin to log in — default credentials printed by the seed script (see console):

- Email: `admin@productsinmalta.com`
- Password: `ChangeMe123!`  ← **change immediately in production**

## Run the MCP Server

The MCP server is a **separate process** so it can hold a persistent connection with no timeout.

```bash
cd mcp-server
npm install
MCP_SHARED_DB_URL="file:../dev.db" npm start
# → http://localhost:4000/mcp   (health: /health)
```

Get a token from the admin panel → **MCP Server** page (super-admin only).
The seed also prints a default token you can use immediately.

Connect from Claude Desktop by adding to `claude_desktop_config.json`:
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

## Project Structure

```
productsinmalta/
├── src/
│   ├── app/                     # Next.js app router
│   │   ├── page.tsx             # Homepage (hero, categories, featured, best sellers, winter, weekend, blogs)
│   │   ├── products/            # All products + [slug] detail
│   │   ├── blog/                # Blog list + [slug] detail
│   │   ├── admin/               # Admin panel (dashboard, products, categories, collections, blogs, banners, settings, mcp, login)
│   │   ├── api/                 # REST endpoints (products, blogs, categories, collections, banners, settings, mcp/tokens, affiliate)
│   │   ├── sitemap.ts / robots.ts
│   │   ├── about|contact|privacy|terms/
│   ├── components/              # Reusable UI (Header, Footer, ProductCard, HeroSlider, ProductRow, admin forms)
│   ├── lib/                     # db, auth, utils
│   └── middleware.ts            # Route protection
├── prisma/
│   ├── schema.prisma            # Full DB schema
│   └── seed.ts                  # Sample data + super admin + MCP token
├── mcp-server/
│   ├── src/server.js            # Express + MCP SSE
│   ├── src/tools.js             # 22 MCP tools
│   └── README.md
├── package.json, tailwind.config.ts, next.config.js, tsconfig.json
└── README.md (this file)
```

## Homepage Sections
1. **Hero Slider** — auto-rotating banners (managed in Admin → Banners, slot: `hero`)
2. **Category Grid** — all top categories with images
3. **Featured Products** — products flagged `isFeatured`
4. **Best Sellers** — products flagged `isBestSeller`
5. **Winter Collection** — from `winter-collection` collection
6. **Weekend Sales** — from `weekend-sales` collection
7. **Category-wise Rows** — latest products per top category
8. **From the Blog** — top blogs
9. **Footer** with categories, static pages, social links

## Product Card Features
- Hover slider (primary image → secondary on hover)
- Category badge, discount badge
- Star rating + brand
- **Buy Now** (tracks click → redirects to affiliate URL)
- **View Details** (product detail page)

## Product Detail Includes
- Image gallery (4 thumbnails)
- Title, brand, price, original price with discount
- Full description, tags, category/subcategory/platform
- SEO title/description used for `<title>` and OG tags
- Schema.org Product markup
- Related products
- Affiliate disclosure

## Admin Panel Sections
| Section | Purpose |
|---|---|
| Dashboard | Counts + top-click products |
| Products | Full CRUD + CSV import |
| Categories | Categories + subcategories tree |
| Collections | Featured / Best / Winter / Weekend etc. |
| Blogs | Rich content + SEO fields |
| Banners & Posters | Homepage hero + category banners |
| Settings | GA4, GSC, Meta Pixel, social links |
| MCP Server | (super_admin only) Token management |

## MCP Server Tools (22)
Products: `list_products`, `get_product`, `create_product`, `update_product`, `delete_product`, `search_products`
Blogs: `list_blogs`, `create_blog`, `update_blog`, `delete_blog`
Categories: `list_categories`, `create_category`, `create_subcategory`, `delete_category`
Collections: `list_collections`, `create_collection`, `add_product_to_collection`, `remove_product_from_collection`
Banners: `list_banners`, `create_banner`, `delete_banner`
Settings: `get_settings`, `update_setting`
Stats: `get_dashboard_stats`, `get_top_products`

## Going to Production

1. **Database:** swap SQLite → PostgreSQL by editing `prisma/schema.prisma`:
   ```prisma
   datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
   ```
   Then update `DATABASE_URL` in `.env` (Supabase / Neon / Railway).
2. **Host site:** deploy to Vercel (`vercel --prod`). Add all env vars in the Vercel dashboard.
3. **Host MCP server:** deploy `mcp-server/` to Railway / Render / a VPS. Point `MCP_SHARED_DB_URL` at the same DB. Vercel serverless has request timeouts, so **don't** host the MCP server there.
4. **Domain:** point `productsinmalta.com` DNS to Vercel; update `SITE_URL` and `NEXTAUTH_URL`.
5. **Rotate credentials:** change super-admin password + regenerate MCP tokens.

## CSV Import Format
`title,description,price,originalPrice,brand,platform,affiliateUrl,imageUrl,categorySlug,rating,reviewCount,isFeatured,isBestSeller,tags`
Multiple images: separate with `|`. Multiple tags: separate with `|`.

## Notes
- Sample images use picsum.photos placeholders — replace with real product images.
- The MCP server holds SSE connections open with `setTimeout(0)` on both request and response, ensuring the connection persists indefinitely.
- Only tokens created by a super-admin work for the MCP server.
