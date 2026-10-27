FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable
COPY . .
RUN corepack pnpm install --frozen-lockfile --prod=false
RUN corepack pnpm exec prisma generate --schema prisma/schema.prisma

ENV NODE_ENV=production
EXPOSE 4000

CMD ["corepack", "pnpm", "--filter", "@pastlife/api", "start"]
