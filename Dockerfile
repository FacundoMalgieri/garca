# ============================================
# Stage 1: Dependencies + Playwright
# ============================================
FROM node:22-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

# Install Chromium with all system dependencies automatically
RUN npx playwright install --with-deps chromium

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-slim AS builder

WORKDIR /app

# Avoid Sharp issues with libvips in slim images
ENV NEXT_SHARP_IGNORE_GLOBAL_LIBVIPS=1
# Disable Next.js telemetry for deterministic builds
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time args for NEXT_PUBLIC_* variables (must be available during build)
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ENCRYPTION_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_ENCRYPTION_KEY=$NEXT_PUBLIC_ENCRYPTION_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ============================================
# Stage 3: Runner
# ============================================
# Base from `deps` so we keep a single set of system libs (apt) + Playwright
# browser cache. A fresh `node:22-slim` + `npx playwright install-deps` would
# duplicate the same apt work (~40s) and can pull a different @playwright version
# (see build logs: runner npx → playwright@1.59 while lockfile may differ).
FROM deps AS runner

# Drop the full dev `node_modules` in /app; we'll replace with Next standalone.
RUN rm -rf /app
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV NEXT_TELEMETRY_DISABLED=1
# Tell Playwright where to find pre-installed browsers (avoid runtime download)
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright
ENV HOSTNAME=0.0.0.0

# Copy standalone build (pruned `node_modules` for Node server only)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# Standalone uses server.js instead of npm start
CMD ["node", "server.js"]
