FROM oven/bun:latest

WORKDIR /app

COPY package.json ./
COPY bun.lock ./
COPY src ./

RUN bun install

COPY . .

RUN bun run format

ENTRYPOINT [ "bun", "run", "start:prod" ]

