#!/usr/bin/env bash
set -euo pipefail

TAG="${1:?tag required}"
GHCR_USER="${2:?github actor required}"
IFS= read -r GHCR_TOKEN

cd /srv/joanroucoux.fr

exec 9> /srv/joanroucoux.fr/.deploy.lock
flock -w 600 9 || { echo "deploy lock still held after 600 s" >&2; exit 1; }

printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
trap 'docker logout ghcr.io > /dev/null || true' EXIT

if grep -q '^SITE_TAG=' .env 2> /dev/null; then
  sed -i "s|^SITE_TAG=.*|SITE_TAG=${TAG}|" .env
else
  printf 'SITE_TAG=%s\n' "$TAG" >> .env
fi

docker compose -f compose.prod.yaml pull site
docker compose -f compose.prod.yaml up -d --wait --wait-timeout 120 site

docker image ls --format '{{.Repository}}:{{.Tag}}' \
  | grep -E '^ghcr\.io/joanroucoux/joanroucoux\.fr:' \
  | grep -vE ":${TAG}\$" \
  | xargs -r docker image rm || true
docker image prune -f
