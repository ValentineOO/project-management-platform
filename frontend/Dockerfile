FROM node:22-alpine AS base

WORKDIR /app

# ── Development ──────────────────────────────────────────────────────────────
FROM base AS development

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# ── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder

# Declared here so it's available during the Next.js build.
# Pass via: docker build --build-arg NEXT_PUBLIC_API_URL=https://your-domain.com/api
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json .npmrc* ./
RUN npm ci

COPY . .
RUN npm run build

# ── Production ────────────────────────────────────────────────────────────────
FROM base AS production

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
