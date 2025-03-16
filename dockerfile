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
RUN apt update
RUN apt install -y ffmpeg
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/server/env.mjs /app/env.mjs
CMD ["bash", "-c", "node env.mjs && node .output/server/index.mjs"]
