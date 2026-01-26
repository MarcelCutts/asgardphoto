#!/bin/bash
# Cloudflare Configuration Verification Script
# Run with: ./scripts/verify-cloudflare.sh

# flarectl uses CF_API_TOKEN, wrangler uses CLOUDFLARE_API_TOKEN
export CF_API_TOKEN="${CF_API_TOKEN:-$CLOUDFLARE_API_TOKEN}"

run_check() {
  local name="$1"
  shift
  echo -e "\n=== $name ==="
  if "$@" 2>&1; then
    echo "[OK]"
  else
    echo "[FAILED or NO PERMISSION]"
  fi
}

echo "=========================================="
echo "  Cloudflare Configuration Verification"
echo "=========================================="

# Zone checks (flarectl)
if [ -n "$CF_API_TOKEN" ]; then
  run_check "Zone Info" flarectl zone info --zone=asgard.photo
  run_check "DNS Records" flarectl dns list --zone=asgard.photo
else
  echo -e "\n[SKIP] flarectl checks - no CF_API_TOKEN set"
fi

# R2 and Workers checks (wrangler)
run_check "R2 Buckets" npx wrangler r2 bucket list
# Note: wrangler r2 object doesn't have a list command - skip this check
echo -e "\n=== R2 Objects ==="
echo "[SKIP] wrangler r2 object doesn't support listing - verify via dashboard or curl"
run_check "Wrangler Auth" npx wrangler whoami

echo -e "\n=========================================="
echo "  Connectivity Tests (curl)"
echo "=========================================="

echo -e "\n=== Test R2 Direct Access ==="
echo "URL: https://photos.asgard.photo/rnconf2024/ReactNativeConf2024-1.jpg"
response=$(curl -4 -sI "https://photos.asgard.photo/rnconf2024/ReactNativeConf2024-1.jpg" 2>&1 | head -1)
echo "$response"
[[ "$response" == *"200"* ]] && echo "[OK]" || echo "[FAILED]"

echo -e "\n=== Test Image Resizing ==="
echo "URL: https://photos.asgard.photo/cdn-cgi/image/width=400/rnconf2024/ReactNativeConf2024-1.jpg"
response=$(curl -4 -sI "https://photos.asgard.photo/cdn-cgi/image/width=400/rnconf2024/ReactNativeConf2024-1.jpg" 2>&1 | head -1)
echo "$response"
[[ "$response" == *"200"* ]] && echo "[OK]" || echo "[FAILED]"

echo -e "\n=== Test Main Site ==="
echo "URL: https://asgard.photo"
response=$(curl -4 -sI "https://asgard.photo" 2>&1 | head -1)
echo "$response"
[[ "$response" == *"200"* ]] && echo "[OK]" || echo "[FAILED]"

echo -e "\n=========================================="
echo "  Verification Complete"
echo "=========================================="
