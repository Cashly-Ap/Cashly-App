ARG NODE_VERSION=22.12-alpine

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

RUN apk add --no-cache git wget unzip bash curl

RUN wget -qO- https://bun.sh/install | bash -s "bun-v1.3.3"
ENV PATH="/root/.bun/bin:${PATH}"

COPY package.json bunfig.toml ./

RUN bun install

COPY . .

RUN bun run build

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

RUN apk add --no-cache wget unzip bash curl

RUN wget -qO- https://bun.sh/install | bash -s "bun-v1.3.3"
ENV PATH="/root/.bun/bin:${PATH}"

RUN bun add -g serve

COPY --from=builder /app/dist/parsun-app/browser ./dist

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080} -n"]
