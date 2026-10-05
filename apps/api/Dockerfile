FROM node:22-slim AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm db:generate

FROM oven/bun:slim AS runner

WORKDIR /app/apps/api

COPY --from=builder /app/apps/api ./
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/node_modules /app/node_modules

EXPOSE 4000

ENV API_PORT=4000
ENV NODE_ENV=production

CMD ["bun", "src/index.ts"]
