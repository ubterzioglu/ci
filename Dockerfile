# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# Çi Neo Cucina — production image for Coolify / any Docker host.
# Multi-stage build using Next.js standalone output. Exposes port 3000.
# Set runtime env vars (NEXT_PUBLIC_SUPABASE_URL, etc.) in Coolify's UI.
# ---------------------------------------------------------------------------

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# --- Dependencies ----------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# --- Build -----------------------------------------------------------------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined at build time; provide them as build args
# in Coolify if you want them baked in. They are also read at runtime.
RUN pnpm build

# --- Runner ----------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone server + static assets + public files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
