FROM node:24-bookworm AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-lock.yaml .
RUN pnpm fetch

COPY . .
RUN pnpm install --offline --ignore-scripts --frozen-lockfile

ARG NODE_ENV=production
ARG HOST_ENV
ARG DATABASE_URL
ARG SENTRY_AUTH_TOKEN
ARG SOURCE_VERSION
ENV DATABASE_URL=$DATABASE_URL

RUN pnpm b prepare
RUN pnpm b build
RUN pnpm b sentry
RUN pnpm w build
RUN CI=true pnpm prune --prod --ignore-scripts

FROM node:24-bookworm

COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml

COPY --from=builder /app/webapp/package.json /app/webapp/package.json
COPY --from=builder /app/backend/package.json /app/backend/package.json
COPY --from=builder /app/backend/prisma.config.ts /app/backend/prisma.config.ts
COPY --from=builder /app/shared/package.json /app/shared/package.json

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/webapp/node_modules /app/webapp/node_modules
COPY --from=builder /app/backend/node_modules /app/backend/node_modules
COPY --from=builder /app/shared/node_modules /app/shared/node_modules

COPY --from=builder /app/webapp/dist /app/webapp/dist
COPY --from=builder /app/backend/dist /app/backend/dist
COPY --from=builder /app/backend/src/prisma /app/backend/src/prisma

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG SOURCE_VERSION
ENV SOURCE_VERSION=$SOURCE_VERSION

CMD ["sh", "-c", "cd /app/backend && ./node_modules/.bin/prisma migrate deploy && NODE_ENV=production node ./dist/backend/src/index.js"]
