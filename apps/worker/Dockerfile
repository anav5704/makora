FROM node:22-slim AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY . .

RUN pnpm install --frozen-lockfile

ARG MAIN_DATABASE_URL
ENV MAIN_DATABASE_URL=$MAIN_DATABASE_URL

ARG CHESS_DATABASE_URL
ENV CHESS_DATABASE_URL=$CHESS_DATABASE_URL

RUN pnpm db:generate

FROM oven/bun:slim AS runner

ARG INSTALL_STOCKFISH=false

RUN if [ "$INSTALL_STOCKFISH" = "true" ]; then apt-get update && apt-get install -y --no-install-recommends stockfish && rm -rf /var/lib/apt/lists/* && ln -s /usr/games/stockfish /usr/local/bin/stockfish; fi

WORKDIR /app/apps/worker

COPY --from=builder /app/apps/worker ./
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/node_modules /app/node_modules

CMD ["bun", "src/sync.worker.ts"]
