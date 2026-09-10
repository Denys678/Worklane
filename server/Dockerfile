FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

RUN npm run build

EXPOSE 5001

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]