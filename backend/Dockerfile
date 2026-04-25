FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL 1.1 — required by Prisma on Alpine
RUN apk add --no-cache openssl openssl-dev libc6-compat

COPY package*.json ./
COPY prisma ./prisma/
COPY dist ./dist

RUN npm install --omit=dev
RUN npx prisma generate

EXPOSE 3001
CMD ["node", "dist/main"]