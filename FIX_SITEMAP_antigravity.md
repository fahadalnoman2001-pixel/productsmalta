# Fix Sitemap "Couldn't Fetch" — Google Antigravity Instruction

**Site:** youroffers.eu (Next.js 14 + Prisma + MySQL on Hostinger — see brain.md)
**Problem:** Google Search Console shows "Couldn't fetch" for https://youroffers.eu/sitemap.xml, "Last read" empty, 0 discovered pages.

## Diagnosis (already done)
The sitemap IS valid — 101 URLs, correct youroffers.eu domain, proper XML.
BUT `lastmod` on core pages shows the exact current time with milliseconds on every fetch → the sitemap regenerates from the database on EVERY request instead of being cached. On Hostinger's cold Passenger workers, the live Prisma queries can exceed Googlebot's fetch timeout → "Couldn't fetch".

## The Fix — make the sitemap cacheable so Google never waits on the DB

### Step 1 — Diagnose response time (SSH, see brain.md §6)
```bash
for i in 1 2 3; do curl -s -o /dev/null -w "HTTP:%{http_code} time:%{time_total}s\n" -A "Googlebot" https://youroffers.eu/sitemap.xml; done
```
If the first (cold) response is > ~3–5s, that confirms the cause. If it's already <1s, the sitemap is fine and it's just GSC lag — report back and skip the code change.

### Step 2 — Edit `src/app/sitemap.ts`
- REMOVE any `export const dynamic = "force-dynamic";` (root cause — almost certainly still present).
- SET `export const revalidate = 86400;` (cache for 24h).
- STOP using `new Date()` / `now` for `lastModified`:
  - Product & blog URLs → use the record's real `updatedAt`.
  - Static core pages (home, products, blog, about, contact, privacy, terms) → use a FIXED hardcoded date, e.g. `new Date("2026-08-23")`. NOT the current time. (Stable output = cacheable.)
- Wrap Prisma queries in try/catch that returns the core static URLs on failure, so the sitemap always responds fast even if the DB is slow.
- Homepage entry should use trailing slash: `https://youroffers.eu/`.

### Step 3 — Confirm Content-Type
Ensure `/sitemap.xml` serves as `Content-Type: application/xml` (Next.js default for sitemap.ts — just confirm no middleware overrides it).

### Step 4 — Build & deploy
Standard standalone build → tar → SFTP → touch `tmp/restart.txt` (brain.md §5).

### Step 5 — Verify
```bash
curl -s https://youroffers.eu/sitemap.xml | head -6            # lastmod should be STABLE on repeat
curl -s -o /dev/null -w "cold time: %{time_total}s\n" https://youroffers.eu/sitemap.xml
```
Cold response should now be <1s and the `lastmod` should NOT change on repeated fetches.

## Then in Google Search Console (user does this)
1. Sitemaps → ⋮ next to the failing entry → Remove sitemap.
2. Re-add: type `sitemap.xml` → Submit.
3. URL Inspection → paste the sitemap URL → confirm it loads.
4. Wait 1–3 days. GSC "Couldn't fetch" is sticky and lags even after a successful read. Watch the "Last read" column and "Discovered pages" (~100 = success).

## Meanwhile
Google can still discover pages via URL Inspection → "Request Indexing" (independent of the sitemap). Keep requesting indexing on key blog URLs.
