FROM node:22-slim AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm db:generate

RUN pnpm --filter worker --prod --legacy deploy /app/deploy/worker

FROM oven/bun:slim AS runner

ARG INSTALL_STOCKFISH=false

RUN if [ "$INSTALL_STOCKFISH" = "true" ]; then apt-get update && apt-get install -y --no-install-recommends stockfish && rm -rf /var/lib/apt/lists/* && ln -s /usr/games/stockfish /usr/local/bin/stockfish; fi

WORKDIR /app/apps/worker

COPY --from=builder /app/deploy/worker ./
COPY --from=builder /app/packages/db/main/generated ./node_modules/@makora/db/main/generated
COPY --from=builder /app/packages/db/chess/generated ./node_modules/@makora/db/chess/generated

CMD ["bun", "src/sync.worker.ts"]
