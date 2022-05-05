FROM node:16-alpine as builder

WORKDIR /bot
COPY package.json yarn.lock ./
RUN yarn install

COPY src src
COPY tsconfig.json .
RUN yarn build

FROM node:16-alpine as runner

RUN apk add --no-cache ffmpeg

WORKDIR /bot
COPY package.json yarn.lock ./
ENV NODE_ENV production
RUN yarn install

COPY --from=builder /bot/dist dist

ENTRYPOINT [ "node", "dist"]
