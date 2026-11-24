FROM node:22-bookworm-slim

ARG TARGETARCH

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gzip \
    postgresql-client \
  && rm -rf /var/lib/apt/lists/*

# supercronic = cron fiable pour conteneurs
RUN case "${TARGETARCH}" in \
      amd64) SC_ARCH=amd64 ;; \
      arm64) SC_ARCH=arm64 ;; \
      *) SC_ARCH=amd64 ;; \
    esac \
  && curl -fsSL \
    "https://github.com/aptible/supercronic/releases/download/v0.2.33/supercronic-linux-${SC_ARCH}" \
    -o /usr/local/bin/supercronic \
  && chmod +x /usr/local/bin/supercronic

WORKDIR /app

# Uniquement la lib Cloudinary (pas toute l’app)
RUN npm init -y >/dev/null 2>&1 \
  && npm install --omit=dev cloudinary@2.11.0 \
  && npm cache clean --force

COPY backup.mjs ./backup.mjs
COPY crontab ./crontab

ENV TZ=Africa/Douala
ENV NODE_ENV=production

CMD ["supercronic", "-passthrough-logs", "/app/crontab"]
