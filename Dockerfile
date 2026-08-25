# Production image: build the Next.js + Payload app and run it with persistent SQLite + media volumes.
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

FROM node:24-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 DATABASE_URI=file:/data/payload.db
COPY --from=build /app ./
VOLUME ["/data", "/app/media"]
EXPOSE 3000
CMD ["npm", "start"]
