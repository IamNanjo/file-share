FROM node:lts AS builder
WORKDIR /app
COPY . .
RUN npm install --include=dev
RUN npm run build

FROM node:lts
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV FILESHARE_UPLOADS_PATH=/app/uploads
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/server/env.mjs /app/env.mjs
CMD ["sh", "-c", "cd /app && node env.mjs && node .output/server/index.mjs"]
