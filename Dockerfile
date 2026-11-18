FROM node:22-alpine

WORKDIR /src

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 8010

CMD ["npm", "start"]