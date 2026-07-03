FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN yarn install || npm install
COPY . .
RUN yarn build || npm run build
EXPOSE 3001
CMD ["node", "dist/main"]
