ARG NODE_VERSION=18.16.0
ARG PNPM_VERSION=8.6.0

FROM node:${NODE_VERSION}-alpine as base

RUN npm install -g pnpm@$PNPM_VERSION

FROM base as builder

WORKDIR /bot
COPY package.json pnpm-lock.yaml tsconfig.json build.mjs ./
RUN pnpm install --frozen-lockfile

COPY src src
RUN pnpm build

FROM base as bot

ENV NODE_ENV=production

WORKDIR /bot
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --production

COPY --from=builder /bot/dist/bundle.cjs bundle.cjs

ENTRYPOINT [ "node", "bundle.cjs"]
