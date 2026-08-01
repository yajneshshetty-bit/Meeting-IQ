FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/bff/package.json ./apps/bff/
RUN npm install --omit=dev

COPY apps/bff ./apps/bff
COPY migrations ./migrations
COPY scripts/migrate.js scripts/seed-dev-users.js ./scripts/

ENV NODE_ENV=production
ENV MEETINGIQ_HOST=0.0.0.0
ENV MEETINGIQ_PORT=3001

EXPOSE 3001

COPY deploy/bff-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
