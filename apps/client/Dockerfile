ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS base

ARG PORT=3000

WORKDIR /app/client

FROM base AS build

RUN npm i -g pnpm

COPY --link package.json .

RUN pnpm install

COPY --link . .

RUN pnpm build

FROM base

COPY --from=build /app/client/.output /app/client/.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]