# ==========================================
# 1. Base Stage
# ==========================================
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# ==========================================
# 2. Dependencies Stage
# ==========================================
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# ==========================================
# 3. Builder Stage
# ==========================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ==========================================
# 4. Production Runner Stage
# ==========================================
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=5001

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

EXPOSE 5001

CMD ["node", "dist/main"]
