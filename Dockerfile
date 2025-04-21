FROM node:20-slim AS base

WORKDIR /project

COPY package*.json ./
RUN apt-get update \
    && apt-get install -y \
        make \
        g++ \
        bash \
        curl \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN npm ci

CMD ["node", "index.js"]