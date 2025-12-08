FROM node:22-alpine AS builder

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

RUN pnpm -r build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
