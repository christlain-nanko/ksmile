#!/bin/sh
set -eu

echo "[ksmile] Attente de PostgreSQL…"
i=0
until npx prisma db push --skip-generate >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "[ksmile] PostgreSQL injoignable après 30 tentatives."
    exit 1
  fi
  echo "[ksmile] DB pas prête ($i/30), nouvel essai…"
  sleep 2
done

echo "[ksmile] Schéma Prisma synchronisé."

echo "[ksmile] Sync compte admin depuis .env…"
node prisma/seed-admin.mjs

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[ksmile] Seed catalogue de départ…"
  npx tsx prisma/seed.ts
fi

echo "[ksmile] Démarrage Next.js…"
exec node server.js
