FROM node:14-alpine as builder

WORKDIR /bot
COPY package*.json ./
RUN npm install

COPY src src
COPY tsconfig.json .
RUN npm run build

FROM node:14-alpine as runner

WORKDIR /bot
COPY package*.json ./
ENV NODE_ENV production
RUN npm install

COPY --from=builder /bot/dist dist

ENTRYPOINT [ "node", "dist"]
