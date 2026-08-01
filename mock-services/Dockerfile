FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY mock-services ./mock-services
COPY apps ./apps
RUN npm install --omit=dev
ENV MOCK_SIMULATE_LATENCY=0
ENV NODE_ENV=production
