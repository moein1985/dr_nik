#!/bin/bash

# This script runs inside the Docker container
BASE_URL="http://localhost:3000"

echo "=================================="
echo "All Pages Smoke Test"
echo "=================================="
echo ""

pages=(
  "/fa"
  "/fa/fresh"
  "/fa/about"
  "/fa/services"
  "/fa/gallery"
  "/fa/staff"
  "/fa/contact"
  "/en"
  "/en/fresh"
  "/en/about"
  "/en/services"
  "/en/gallery"
  "/en/staff"
  "/en/contact"
  "/ar"
  "/ar/fresh"
  "/ar/about"
  "/ar/services"
  "/ar/gallery"
  "/ar/staff"
  "/ar/contact"
)

failed=0

for page in "${pages[@]}"; do
  url="$BASE_URL$page"
  status=$(wget -q -O /dev/null -S "$url" 2>&1 | grep "HTTP/" | awk '{print $2}')
  
  if [ -z "$status" ]; then
    echo "✗ $page => CONNECTION_FAILED"
    failed=$((failed + 1))
  elif [ "$status" -lt 500 ]; then
    echo "✓ $page => $status"
  else
    echo "✗ $page => $status"
    failed=$((failed + 1))
  fi
done

echo ""
echo "=================================="
if [ $failed -eq 0 ]; then
  echo "All pages PASSED"
  exit 0
else
  echo "$failed pages FAILED"
  exit 1
fi
