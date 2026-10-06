FROM node:22-slim AS builder

RUN npm install -g pnpm@10.23.0

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm db:generate

RUN pnpm --filter api --prod --legacy deploy /app/deploy/api

# pnpm deploy respects .gitignore, so the Prisma generated clients are missing.
# Copy them into every deployed @makora/db copy (store layout varies by pnpm version).
RUN for d in $(find /app/deploy/api/node_modules -type d -path "*@makora/db"); do \
        cp -r /app/packages/db/main/generated "$d/main/generated"; \
        cp -r /app/packages/db/chess/generated "$d/chess/generated"; \
    done

FROM oven/bun:slim AS runner

WORKDIR /app/apps/api

COPY --from=builder /app/deploy/api ./

EXPOSE 4000

ENV API_PORT=4000
ENV NODE_ENV=production

CMD ["bun", "src/index.ts"]
