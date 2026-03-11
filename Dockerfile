# Estágio 1: Build
FROM node:20-slim AS builder
ENV CI=true
RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copia o resto e compila
COPY . .
RUN pnpm exec tsc

# Estágio 2: Execução
FROM node:20-slim
WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/package.json /app/pnpm-lock.yaml* ./
COPY --from=builder /app/dist ./dist

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000
CMD ["node", "dist/server.js"]
