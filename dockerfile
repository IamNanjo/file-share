FROM fedora:latest AS base
WORKDIR /app
RUN dnf update -y
RUN dnf install -y nodejs
RUN dnf install -y ffmpeg
RUN npm i -g pnpm@latest

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate
RUN pnpm run build

FROM base AS deploy
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV FILESHARE_UPLOADS_PATH=/app/uploads
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/server/env.mjs /app/env.mjs
CMD ["bash", "-c", "node env.mjs && node .output/server/index.mjs"]
