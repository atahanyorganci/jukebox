FROM node:16-alpine as builder

WORKDIR /bot
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install

COPY src src
RUN yarn build

FROM node:16-alpine as runner

ENV NODE_ENV production
RUN apk add --no-cache ffmpeg

WORKDIR /bot
COPY package.json yarn.lock ./
RUN yarn install

COPY --from=builder /bot/dist dist

ENTRYPOINT [ "node", "dist"]
