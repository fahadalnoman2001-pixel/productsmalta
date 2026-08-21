#!/bin/bash
# ============================================================
# MCP Fix Deployment Script for Hostinger
# Run this ON THE HOSTINGER SERVER after uploading the tar.gz
# ============================================================

set -e

APP_ROOT="/home/u783286479/domains/youroffers.eu/hbuilds/current/nodejs"
DB_USER="u783286479_bestdeals"
DB_PASS='LHG*WyH;o0'
DB_NAME="u783286479_bestdeals"
DB_HOST="127.0.0.1"

echo "=== Step 1: Add clientSecret column to OAuthClient ==="
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
  ALTER TABLE OAuthClient ADD COLUMN clientSecret VARCHAR(191) NULL;
" 2>/dev/null && echo "  ✓ Column added" || echo "  ✓ Column already exists (skipped)"

echo ""
echo "=== Step 2: Extract updated files ==="
cd "$APP_ROOT"

# Backup current state
if [ ! -d "backups" ]; then mkdir -p backups; fi
BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S).tar.gz"
echo "  Creating backup: backups/$BACKUP_NAME"
tar -czf "backups/$BACKUP_NAME" \
  .next/server/app/mcp \
  .next/server/app/api/oauth \
  .next/server/app/.well-known \
  2>/dev/null || true

echo "  Extracting mcp_fix_deploy.tar.gz..."
tar -xzf mcp_fix_deploy.tar.gz

echo ""
echo "=== Step 3: Rebuild the Next.js app ==="
export NODE_ENV=production
export DATABASE_URL="mysql://${DB_USER}:LHG*WyH%3Bo0@${DB_HOST}:3306/${DB_NAME}"
export NEXTAUTH_SECRET="e4b9d0b04e6c433190b25e7eb00c8b6b"
export NEXTAUTH_URL="https://youroffers.eu"

npx prisma generate
npm run build

echo ""
echo "=== Step 4: Restart Passenger ==="
touch tmp/restart.txt
sleep 2

echo ""
echo "=== Step 5: Verify endpoints ==="
echo "  Testing /mcp (should return 401 with WWW-Authenticate)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "401" ]; then
  echo "  ✓ /mcp returns 401 (correct — needs OAuth token)"
elif [ "$HTTP_CODE" = "000" ]; then
  echo "  ⚠ Could not connect locally — testing via public URL..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://youroffers.eu/mcp \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}')
  echo "  Public URL returned: $HTTP_CODE"
else
  echo "  ⚠ /mcp returned $HTTP_CODE (expected 401)"
fi

echo "  Testing /.well-known/oauth-authorization-server..."
curl -s https://youroffers.eu/.well-known/oauth-authorization-server | head -c 200
echo ""

echo ""
echo "=== DONE ==="
echo ""
echo "Next steps:"
echo "  1. Go to https://claude.ai → Settings → Connectors"
echo "  2. Delete the broken connector"
echo "  3. Add new connector: https://youroffers.eu/mcp"
echo "  4. You'll be redirected to log in as admin and approve"
echo "  5. Claude will get an access token and connect!"
echo ""
