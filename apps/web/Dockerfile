FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN yarn install || npm install
COPY . .
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/api
RUN yarn build || npm run build
EXPOSE 3000
CMD ["yarn", "start"]
