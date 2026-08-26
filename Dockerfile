# syntax=docker/dockerfile:1.7
#
# Production image for the portfolio (Next.js 16 + Payload CMS 3 + SQLite).
#
#   docker build -t portfolio .
#   docker run -p 3000:3000 -e PAYLOAD_SECRET=... -v portfolio-data:/data portfolio
#
# Everything that must survive a restart/upgrade lives in the /data volume:
#   /data/payload.db   SQLite database (content, users, messages)
#   /data/media        uploaded images/videos
#
# Build-time only (baked into the client bundle): NEXT_PUBLIC_FORM_ENDPOINT.
# Runtime: PAYLOAD_SECRET (required), SITE_URL, DATABASE_URI, MEDIA_DIR, PORT.

ARG NODE_VERSION=24

# ---- deps: install with a cached npm store -----------------------------------
FROM node:${NODE_VERSION}-slim AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ---- build: next build -> .next/standalone ------------------------------------
FROM node:${NODE_VERSION}-slim AS build
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_FORM_ENDPOINT
ENV NEXT_PUBLIC_FORM_ENDPOINT=${NEXT_PUBLIC_FORM_ENDPOINT}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- run: minimal runtime, non-root, only traced files ------------------------
FROM node:${NODE_VERSION}-slim AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    DATABASE_URI=file:/data/payload.db \
    MEDIA_DIR=/data/media

RUN mkdir -p /data/media && chown -R node:node /data
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/access').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
