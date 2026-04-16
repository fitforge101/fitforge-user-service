FROM node:22-alpine

RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copy lockfile alongside package.json so npm ci can install exact versions
COPY package.json package-lock.json ./
RUN npm install

COPY src/ ./src/

EXPOSE 5002

CMD ["node", "src/index.js"]