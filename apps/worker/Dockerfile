FROM node:22-slim AS builder

RUN npm install -g pnpm@10.23.0

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm db:generate

RUN pnpm --filter worker --prod --legacy deploy /app/deploy/worker

# pnpm deploy respects .gitignore, so the Prisma generated clients are missing.
# Copy them into every deployed @makora/db copy (store layout varies by pnpm version).
RUN for d in $(find /app/deploy/worker/node_modules -type d -path "*@makora/db"); do \
        cp -r /app/packages/db/main/generated "$d/main/generated"; \
        cp -r /app/packages/db/chess/generated "$d/chess/generated"; \
    done

FROM oven/bun:slim AS runner

ARG INSTALL_STOCKFISH=false

RUN if [ "$INSTALL_STOCKFISH" = "true" ]; then apt-get update && apt-get install -y --no-install-recommends stockfish && rm -rf /var/lib/apt/lists/* && ln -s /usr/games/stockfish /usr/local/bin/stockfish; fi

WORKDIR /app/apps/worker

COPY --from=builder /app/deploy/worker ./

CMD ["bun", "src/sync.worker.ts"]
