FROM node:22-slim AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm db:generate

RUN pnpm --filter openings --prod --legacy deploy /app/deploy/openings

FROM oven/bun:slim AS runner

WORKDIR /app/apps/openings

COPY --from=builder /app/deploy/openings ./
COPY --from=builder /app/packages/db/main/generated ./node_modules/@makora/db/main/generated
COPY --from=builder /app/packages/db/chess/generated ./node_modules/@makora/db/chess/generated

EXPOSE 4001

ENV OPENINGS_PORT=4001
ENV NODE_ENV=production

CMD ["bun", "src/index.ts"]
