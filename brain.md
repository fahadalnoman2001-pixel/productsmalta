# Products in Malta — Architecture, Database & Deployment Manual (`brain.md`)

This document serves as the single source of truth for the **Products in Malta** (`productsinmalta`) codebase, including its MySQL database configuration, Next.js architecture, NextAuth authentication system, Hostinger hosting environment, and deployment procedures.

---

## 1. Project Overview & Technology Stack

- **Framework**: Next.js 14.2.15 (App Router, Server Components, Client Components, Standalone Output)
- **Language**: TypeScript / JavaScript (Node.js 22 LTS)
- **Database ORM**: Prisma ORM 5.22.0 (Configured with MySQL provider & Standalone Binary Query Engine)
- **Database Engine**: MySQL / MariaDB (Hosted on Hostinger)
- **Authentication**: NextAuth.js 4.24.10 (JWT strategy with bcryptjs credential verification)
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **Hosting Environment**: Hostinger Shared Hosting (CloudLinux OS, LiteSpeed Web Server, Phusion Passenger Node.js Runner)

---

## 2. Infrastructure & Credentials Summary

### Domain & Live URLs
- **Live Website**: [https://youroffers.eu/](https://youroffers.eu/)
- **Admin Portal**: [https://youroffers.eu/admin/login](https://youroffers.eu/admin/login)

### Hostinger SSH Access
- **Host**: `82.198.228.66`
- **Port**: `65002`
- **Username**: `u783286479`
- **Server Home Path**: `/home/u783286479`
- **Domain Root**: `/home/u783286479/domains/youroffers.eu`
- **Passenger App Root**: `/home/u783286479/domains/youroffers.eu/hbuilds/current/nodejs`

### MySQL Database Access
- **Database Name**: `u783286479_bestdeals`
- **Database User**: `u783286479_bestdeals`
- **Database Host**: `127.0.0.1` (Port: `3306`)
- **Database Password**: `LHG*WyH;o0`
- **Prisma Connection URL**: `mysql://u783286479_bestdeals:LHG*WyH%3Bo0@127.0.0.1:3306/u783286479_bestdeals`

### Admin Credentials
- **Email**: `fahad@gmail.com`
- **Password**: `TasminaBinte@19`
- **Role**: `super_admin`

### GitHub Repository
- **URL**: [https://github.com/fahadalnoman2001-pixel/productsmalta](https://github.com/fahadalnoman2001-pixel/productsmalta)
- **Branch**: `main`

---

## 3. Database Schema Architecture

The Prisma schema is located at [`prisma/schema.prisma`](file:///h:/Aff%20Marketing/productsinmalta/productsinmalta/prisma/schema.prisma) and is configured with `provider = "mysql"`.

```prisma
generator client {
  provider      = "prisma-client-js"
  engineType    = "binary"
  binaryTargets = ["native", "rhel-openssl-3.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x"]
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### Models Overview
| Model | Description | Key Fields & Annotations |
| :--- | :--- | :--- |
| `User` | Admin users & roles | `id`, `email` (unique), `password` (bcrypt hash), `role` (`super_admin` / `editor`) |
| `Category` | Main shopping categories | `id`, `name`, `slug` (unique), `description` (`@db.Text`), `order`, `showOnHomepage` |
| `Subcategory` | Child categories | `id`, `name`, `slug` (unique), `categoryId` (relates to `Category`) |
| `Product` | Affiliate products | `id`, `title`, `slug` (unique), `description` (`@db.Text`), `images` (`@db.Text`), `price`, `originalPrice`, `affiliateUrl` (`@db.Text`), `rating`, `reviewCount`, `categoryId`, `subcategoryId`, `isFeatured`, `isBestSeller`, `isActive` |
| `Collection` | Curated product sets | `id`, `name`, `slug` (unique), `type` (`featured`, `bestseller`, `seasonal`, `manual`), `showOnHomepage` |
| `CollectionProduct` | Many-to-Many join table | `collectionId`, `productId`, `order` (Composite Primary Key: `[collectionId, productId]`) |
| `Blog` | Articles & buying guides | `id`, `title`, `slug` (unique), `excerpt` (`@db.Text`), `content` (`@db.LongText`), `coverImage`, `author`, `isPublished`, `isTop`, `views` |
| `Banner` | Hero & promo banners | `id`, `title`, `subtitle` (`@db.Text`), `image` (`@db.Text`), `link` (`@db.Text`), `slot` (`hero`, `promo`, `middle`, `double`, `sidebar`), `order`, `isActive` |
| `Setting` | Site key-value config | `key` (id), `value` (`@db.Text`) |
| `MCPToken` | API tokens for MCP automation | `id`, `name`, `token` (unique), `createdBy`, `isActive`, `lastUsed` |
| `ClickLog` | Affiliate link analytics | `id`, `productId`, `ip`, `userAgent` (`@db.Text`), `referer` (`@db.Text`), `createdAt` |

---

## 4. Key Implementation Details & Solutions

### 1. CloudLinux / Hostinger Compatibility: `engineType = "binary"`
- **The Issue**: By default, Prisma uses the `library` engine (`.so.node`), which relies on Tokio timers. Under CloudLinux CageFS virtualization on shared hosting, in-process Tokio timer pools panic with `timer has gone away` or `Resource temporarily unavailable`.
- **The Solution**: Set `engineType = "binary"` with `binaryTargets = ["native", "rhel-openssl-3.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x"]` in `schema.prisma`. This instructs Prisma to spawn the standalone Linux query engine binary instead of an in-process native addon, ensuring 100% stability.

### 2. Standalone Next.js Build for Shared Hosting
- In [`next.config.js`](file:///h:/Aff%20Marketing/productsinmalta/productsinmalta/next.config.js), `output: "standalone"` is enabled.
- Next.js traces all dependencies and outputs a self-contained Node.js server into `.next/standalone/`.
- This eliminates the need to run heavy `npm install` and webpack compiles inside resource-constrained shared hosting containers.

### 3. Global Environment Variable Persistence (`preload-timestamp.js`)
- Hostinger's Passenger runtime automatically preloads `/home/u783286479/domains/youroffers.eu/hbuilds/config/preload-timestamp.js` before executing `server.js`.
- The environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, etc.) are defined in `preload-timestamp.js`, in `current/nodejs/.env`, and as safe fallbacks in [`src/lib/db.ts`](file:///h:/Aff%20Marketing/productsinmalta/productsinmalta/src/lib/db.ts) and [`src/lib/auth.ts`](file:///h:/Aff%20Marketing/productsinmalta/productsinmalta/src/lib/auth.ts).

### 4. Passenger Application Restart Mechanism
- Whenever updates are deployed, touching `current/nodejs/tmp/restart.txt` and killing stale `next-server` processes triggers Passenger to reload workers gracefully without downtime.

---

## 5. Development & Deployment Workflow

### Local Development
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Generate Prisma client**:
   ```bash
   npm run db:generate
   ```
3. **Run local dev server**:
   ```bash
   npm run dev
   ```

### Building & Deploying to Hostinger

When you make changes to the code or database schema:

1. **Commit & Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your update description"
   git push origin main
   ```

2. **Build Standalone Output**:
   ```bash
   npm run build
   ```

3. **Package the standalone bundle**:
   ```powershell
   Copy-Item -Recurse -Force '.next/static' '.next/standalone/.next/static'
   Copy-Item -Recurse -Force 'public' '.next/standalone/public'
   Copy-Item -Recurse -Force 'prisma' '.next/standalone/prisma'
   Set-Location '.next/standalone'
   tar -czf '../../deploy.tar.gz' *
   Set-Location '../..'
   ```

4. **Upload & Deploy to Hostinger**:
   Run the deployment script (or execute SFTP transfer to `/home/u783286479/domains/youroffers.eu/hbuilds/current/nodejs/` and extract `deploy.tar.gz`).
   ```bash
   node scratch/upload_and_deploy2.js
   ```

---

## 6. Server Health & Troubleshooting Commands

If you ever need to inspect or restart the server via SSH:

### SSH Login
```bash
ssh -p 65002 u783286479@82.198.228.66
# Enter Password: Fahad@0210
```

### Check Logs
```bash
# View live application logs:
tail -f ~/domains/youroffers.eu/hbuilds/current/nodejs/console.log

# View system error logs:
tail -f ~/domains/youroffers.eu/hbuilds/current/nodejs/stderr.log
```

### Restart Passenger Application
```bash
touch ~/domains/youroffers.eu/hbuilds/current/nodejs/tmp/restart.txt
pkill -f "next-server" || true
```

### Test Database Direct Connection
```bash
mysql -h 127.0.0.1 -u u783286479_bestdeals -p'LHG*WyH;o0' u783286479_bestdeals -e "SHOW TABLES; SELECT COUNT(*) FROM Product;"
```

---

## 7. Verified Working Routes

- **Homepage**: `/`
- **Products Catalog**: `/products`
- **Product Detail**: `/products/[slug]`
- **Categories**: `/products?category=[slug]`
- **Collections**: `/products?collection=[slug]`
- **Blog Listing**: `/blog`
- **Blog Article**: `/blog/[slug]`
- **About Us**: `/about`
- **Contact Us**: `/contact`
- **Admin Login**: `/admin/login`
- **Admin Dashboard**: `/admin`
- **Admin Products**: `/admin/products`
- **Admin Categories**: `/admin/categories`
- **Admin Collections**: `/admin/collections`
- **Admin Banners**: `/admin/banners`
- **Admin Blogs**: `/admin/blogs`
- **Admin Settings**: `/admin/settings`
- **Admin MCP Tokens**: `/admin/mcp`
- **REST APIs**: `/api/products`, `/api/categories`, `/api/banners`, `/api/blogs`, `/api/settings`
- **OAuth authorize (for claude.ai connector)**: `/oauth/authorize`
- **OAuth token/register (API)**: `/api/oauth/token`, `/api/oauth/register`
- **OAuth discovery**: `/.well-known/oauth-authorization-server`, `/.well-known/oauth-protected-resource`

---

## 8a. MCP Server & OAuth (Claude / AI Agent Access)

### Why OAuth exists here
`mcp-server/` is a standalone Express process (not part of the Next.js app) that speaks
the MCP protocol over SSE at `/mcp`. It was originally token-only: generate a Bearer
token in `/admin/mcp`, paste it into an MCP client. That works for Claude Desktop's
local config (custom headers), but **claude.ai's web/mobile custom-connector UI only
supports OAuth 2.1 with Dynamic Client Registration — it has no field for a static
Bearer token.** Without OAuth, adding `https://youroffers.eu/mcp` as a connector fails
with a 404 on a guessed `/authorize` URL.

The fix is a minimal OAuth 2.1 authorization-server shim living in the main Next.js
app (not the mcp-server process), which wraps the existing token system rather than
replacing it:

- `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource`
  — RFC 8414 / RFC 9728 discovery documents claude.ai fetches automatically.
- `POST /api/oauth/register` — RFC 7591 Dynamic Client Registration. Open endpoint;
  registering a client grants no access by itself.
- `GET /oauth/authorize` — requires an active `super_admin` NextAuth session (redirects
  to `/admin/login?callbackUrl=...` if not logged in), then shows a one-click consent
  page.
- `POST /api/oauth/approve` — issues a short-lived (5 min), single-use authorization
  code after the admin clicks Authorize.
- `POST /api/oauth/token` — PKCE (S256) verification, then mints a normal `MCPToken`
  row (same table/format as manually-generated tokens — shows up in `/admin/mcp`
  "Active Tokens" like any other) and returns it as `access_token`. No `expires_in` is
  returned, matching the "tokens never expire until revoked" design.
- Two new Prisma models: `OAuthClient` (registered clients) and `OAuthCode`
  (short-lived auth codes). Run `npx prisma migrate dev` / `db push` after pulling
  this change, and redeploy with the updated Prisma client on Hostinger.

Net effect: **access is still gated entirely by "can this person log into `/admin`"**
— OAuth is just the transport claude.ai insists on; there's no separate consent/authz
system to maintain.

### mcp-server changes (reliability + discoverability)
- Every route (`/mcp`, `/mcp/message`, `/health`, `/tools/:name`) is registered at both
  the bare path and the `/mcp`-prefixed path, so it works whether the reverse proxy in
  front strips the `/mcp` prefix or passes it through unchanged.
- Listens on `process.env.PORT` first (what Passenger assigns when it manages the
  process), falling back to `MCP_SERVER_PORT`.
- Sends an SSE keep-alive comment every 20s so a reverse proxy's idle-connection
  timeout doesn't drop long-lived MCP sessions (token/app-level expiry was already
  disabled — this closes the proxy-layer gap).
- On a 401 (missing bearer token), responds with
  `WWW-Authenticate: Bearer resource_metadata="<issuer>/.well-known/oauth-protected-resource"`
  so OAuth-aware clients discover the real authorize/token endpoints instead of
  guessing `/authorize` at the domain root.
- New env vars: `MCP_PUBLIC_PATH` (default `/mcp`), `MCP_ISSUER_URL` (default
  `https://youroffers.eu` — the main app's origin, which hosts the OAuth endpoints).

### Deployment status (as of 2026-08-20)
`mcp-server/` has **not yet been deployed** to Hostinger as its own always-running
process — nothing in this file or on the server currently exposes port 4000 publicly.
To finish this:
1. In Hostinger hPanel → Websites → youroffers.eu → Advanced → Node.js, create a
   **second** Node.js application: Domain `youroffers.eu`, Application URL `/mcp`,
   Application root pointing at the deployed `mcp-server/` folder, startup file
   `src/server.js`.
2. Set its env vars: `MCP_SHARED_DB_URL` (same MySQL URL as the main app). Leave
   `PORT`/`MCP_SERVER_PORT` unset — Passenger assigns the port.
3. `npm install` inside that app root (hPanel does this automatically on create/restart
   for Node apps it manages), then start it.
4. Redeploy the main Next.js app with the OAuth routes above and the new Prisma
   migration applied, so `/oauth/authorize` and `/.well-known/*` are live.
5. Test end-to-end: add `https://youroffers.eu/mcp` as a custom connector on claude.ai
   → should redirect to `/admin/login` (if not already signed in) → consent page →
   redirect back to claude.ai with a working token.

---

## 8. Recent Work & Action Log

Below is the detailed chronological record of all diagnostics, schema migrations, bug fixes, and deployment tasks completed:

### 1. Hostinger Environment Inspection & Diagnostics
- Established SSH connection to Hostinger server (`82.198.228.66:65002`).
- Discovered Phusion Passenger runtime setup in `hbuilds/current/nodejs/` and verified MySQL service availability.
- Identified the initial HTTP 500 error root cause: The app was configured with SQLite (`file:./dev.db`), and the database tables did not exist on the production server.

### 2. MySQL Database Migration & Schema Optimization
- Switched Prisma ORM provider from SQLite to MySQL in [`prisma/schema.prisma`](file:///h:/Aff%20Marketing/productsinmalta/productsinmalta/prisma/schema.prisma).
- Annotated large text fields with `@db.Text` and `@db.LongText` (e.g. product descriptions, multiple image URL arrays, affiliate tracking URLs, rich blog articles, site settings).
- Configured `engineType = "binary"` and `binaryTargets = ["native", "rhel-openssl-3.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x"]` to prevent Tokio timer panics (`timer has gone away`) under CloudLinux CageFS virtualization.
- Synchronized all 11 database models to the MySQL database `u783286479_bestdeals`.
- Populated database with complete initial seed dataset (6 categories, 5 subcategories, 12 products, 4 collections, 11 banners, 4 blog articles, 11 settings, and default super admin user).

### 3. Application Codebase & NextAuth Resilience
- Added `output: "standalone"` to [`next.config.js`](file:///h:/Aff%20Marketing/productsinmalta/productsinmalta/next.config.js) to enable self-contained Node.js builds.
- Added default MySQL connection string fallbacks in [`src/lib/db.ts`](file:///h:/Aff%20Marketing/productsinmalta/productsinmalta/src/lib/db.ts) to eliminate broken SQLite fallback references.
- Configured explicit `secret` fallback in [`src/lib/auth.ts`](file:///h:/Aff%20Marketing/productsinmalta/productsinmalta/src/lib/auth.ts) to guarantee consistent session signing.
- Updated [`.env.example`](file:///h:/Aff%20Marketing/productsinmalta/productsinmalta/.env.example) and local [`.env`](file:///h:/Aff%20Marketing/productsinmalta/productsinmalta/.env) with MySQL connection URLs.
- Updated [`.gitignore`](file:///h:/Aff%20Marketing/productsinmalta/productsinmalta/.gitignore) to exclude temporary deployment archives (`*.tar.gz`).

### 4. Global Environment Variable Persistence on Hostinger
- Configured Hostinger's preloaded script `/home/u783286479/domains/peachpuff-chimpanzee-259560.hostingersite.com/hbuilds/config/preload-timestamp.js` to automatically inject `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SUPER_ADMIN_EMAIL`, etc. into `process.env`.
- Ensured environment variables persist across automatic Git builds, version symlink switches, and Passenger worker restarts.

### 5. Production Build & Deployment Pipeline
- Generated standalone production build including client assets (`.next/static`), public directory, and Linux query engine binaries.
- Streamed the deployment archive (`deploy.tar.gz`) via SFTP and extracted it into the live Passenger application directory.
- Configured proper execution permissions (`chmod +x`) on Prisma query engine binaries.
- Restarted Phusion Passenger (`tmp/restart.txt`) and cleared stale worker processes.

### 6. End-to-End Testing & Verification
- Tested all public pages (Homepage, Products, Categories, Collections, Blog, About, Contact).
- Tested dynamic routes (`/products/[slug]`, `/blog/[slug]`).
- Tested Admin login and authentication flows (`/admin/login`).
- Tested REST APIs (`/api/products`, `/api/categories`, `/api/banners`, `/api/blogs`).
- Verified zero runtime errors in `console.log` and confirmed **HTTP 200 OK** across all endpoints.

### 7. Git Synchronization
- Committed and pushed all changes, schemas, configurations, and documentation to GitHub: [github.com/fahadalnoman2001-pixel/productsmalta](https://github.com/fahadalnoman2001-pixel/productsmalta).

### 8. Multi-Language (i18n) Architecture & Route Implementation (2026-08-23)
- **Supported Locales**: `en` (Default Root, no prefix), `de` (`/de`), `fr` (`/fr`), `es` (`/es`).
- **Locale Routing & Middleware** (`src/middleware.ts`):
  - English at root: `/` and `/*` (internally rewrites to `/[locale]` with `x-locale: en`).
  - Strict canonical redirects: Requests to `/en` or `/en/*` permanently redirect (HTTP 308) to root URLs without `/en`.
  - Non-default languages: Requests to `/de/*`, `/fr/*`, `/es/*` set `x-locale` request header and route into `src/app/[locale]/(site)/`.
  - Private bypass: `/admin/*`, `/api/*`, `/oauth/*`, `/mcp/*`, `/.well-known/*`, and static assets bypass i18n routing.
- **Dynamic `<html lang>`**: `src/app/layout.tsx` reads `x-locale` header and renders `<html lang="en">`, `<html lang="de">`, `<html lang="fr">`, or `<html lang="es">`.
- **Hreflang Alternates**: All pages generate complete `alternates: { canonical, languages: { 'x-default', en, de, fr, es } }` linking language counterparts.
- **Comprehensive UI Dictionaries** (`src/lib/i18n/dictionaries.ts`):
  - English, German, French, and Spanish dictionaries covering header, navigation, filters, product details, blog articles, footer, and full static pages (About Us, Contact, Privacy Policy, Terms of Service).
- **Interactive Language Switcher** (`src/components/layout/LanguageSwitcher.tsx`):
  - Desktop topbar dropdown with flags (🇬🇧, 🇩🇪, 🇫🇷, 🇪🇸) and mobile drawer selector.
  - Automatically translates current route path into selected language.
- **Multi-Language XML Sitemap** (`src/app/sitemap.ts`):
  - Generates entries for all core pages, category pages, collection pages, products, and blogs across all 4 languages.
  - Generates Google-compliant `<xhtml:link rel="alternate" hreflang="..." href="..." />` tags for every entry.
- **Automated Deployment & Testing**:
  - Packaging standalone build with assets (`scripts/deploy_to_hostinger.js`).
  - SFTP streaming and SSH remote extraction with Passenger reload.
  - Live verification confirmed HTTP 200, `<html lang="...">`, `hreflang` alternate tags, and 308 redirects across `https://youroffers.eu/`.

