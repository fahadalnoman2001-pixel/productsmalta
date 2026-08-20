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
- **Live Website**: [https://peachpuff-chimpanzee-259560.hostingersite.com/](https://peachpuff-chimpanzee-259560.hostingersite.com/)
- **Admin Portal**: [https://peachpuff-chimpanzee-259560.hostingersite.com/admin/login](https://peachpuff-chimpanzee-259560.hostingersite.com/admin/login)

### Hostinger SSH Access
- **Host**: `82.198.228.66`
- **Port**: `65002`
- **Username**: `u783286479`
- **Server Home Path**: `/home/u783286479`
- **Domain Root**: `/home/u783286479/domains/peachpuff-chimpanzee-259560.hostingersite.com`
- **Passenger App Root**: `/home/u783286479/domains/peachpuff-chimpanzee-259560.hostingersite.com/hbuilds/current/nodejs`

### MySQL Database Access
- **Database Name**: `u783286479_bestdeals`
- **Database User**: `u783286479_bestdeals`
- **Database Host**: `127.0.0.1` (Port: `3306`)
- **Database Password**: `LHG*WyH;o0`
- **Prisma Connection URL**: `mysql://u783286479_bestdeals:LHG*WyH%3Bo0@127.0.0.1:3306/u783286479_bestdeals`

### Default Admin Credentials (Seed Data)
- **Email**: `admin@productsinmalta.com`
- **Password**: `ChangeMe123!`
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
- Hostinger's Passenger runtime automatically preloads `/home/u783286479/domains/peachpuff-chimpanzee-259560.hostingersite.com/hbuilds/config/preload-timestamp.js` before executing `server.js`.
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
   Run the deployment script (or execute SFTP transfer to `/home/u783286479/domains/peachpuff-chimpanzee-259560.hostingersite.com/hbuilds/current/nodejs/` and extract `deploy.tar.gz`).
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
tail -f ~/domains/peachpuff-chimpanzee-259560.hostingersite.com/hbuilds/current/nodejs/console.log

# View system error logs:
tail -f ~/domains/peachpuff-chimpanzee-259560.hostingersite.com/hbuilds/current/nodejs/stderr.log
```

### Restart Passenger Application
```bash
touch ~/domains/peachpuff-chimpanzee-259560.hostingersite.com/hbuilds/current/nodejs/tmp/restart.txt
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
