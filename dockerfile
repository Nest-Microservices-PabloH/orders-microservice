FROM node:21-alpine3.19

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --ignore-scripts=false --prefer-offline

COPY . .

EXPOSE 3001

