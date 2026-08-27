FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY webapp/package.json webapp/package-lock.json* ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY webapp/package.json webapp/package-lock.json* ./
RUN npm ci
COPY webapp/ .
COPY --from=deps /app/node_modules ./node_modules

# Copy training content (markdown only, videos mounted via PVC)
COPY level-1/*.md ./content/level-1/
COPY level-2/*.md ./content/level-2/
COPY level-3/*.md ./content/level-3/
COPY level-4/*.md ./content/level-4/
COPY level-5/*.md ./content/level-5/

RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/content ./content

# Videos will be mounted at /app/public/videos via PVC
RUN mkdir -p /app/public/videos && chown nextjs:nodejs /app/public/videos

USER 1001
EXPOSE 8080
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
