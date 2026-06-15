#!/bin/bash
# Patch-rebuild and redeploy the Next.js app inside LXC 106.
# Reuses the existing image as base and only rebuilds the Next.js layer with the latest source.

set -euo pipefail

cd /opt/dr_nik_clinic

# Find latest existing app image tag to use as base for the patch
BASE_TAG=$(docker images dr_nik_clinic-app --format '{{.Tag}}' \
  | grep -v '^<none>$' \
  | grep -v 'backup-' \
  | sort -r \
  | head -1)

if [ -z "$BASE_TAG" ]; then
  echo "ERROR: no existing dr_nik_clinic-app image found"
  exit 1
fi

echo "=== Using base image: dr_nik_clinic-app:${BASE_TAG} ==="

# Ensure Dockerfile.patch points to the actual base tag
sed -i -E "s|^FROM dr_nik_clinic-app:[^ ]+( AS .*)?$|FROM dr_nik_clinic-app:${BASE_TAG}\1|" Dockerfile.patch
grep '^FROM ' Dockerfile.patch

NEW_TAG="redeploy-$(date +%Y%m%d)a"
echo "=== Building new image dr_nik_clinic-app:${NEW_TAG} ==="

docker build -f Dockerfile.patch -t "dr_nik_clinic-app:${NEW_TAG}" . 2>&1 | tee /tmp/patch-build.log | tail -40

# Update compose file
sed -i -E "s|dr_nik_clinic-app:redeploy-[0-9a-z-]+|dr_nik_clinic-app:${NEW_TAG}|" docker-compose.yml
grep 'dr_nik_clinic-app' docker-compose.yml

echo "=== Recreating app container ==="
docker compose up -d --force-recreate app

sleep 10
docker ps --filter name=dr_nik_clinic_app
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/en || echo "ERR")
echo "HTTP /en => ${HTTP}"
echo "=== Recent logs ==="
docker logs --tail 25 dr_nik_clinic_app || true
