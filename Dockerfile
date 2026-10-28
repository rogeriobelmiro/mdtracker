FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (including devDependencies needed for build)
RUN npm install

# Copy source code
COPY . .

# Build Vite frontend and bundled server
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled frontend and backend bundle
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.html ./index.html

# Ensure auth storage directory exists
RUN mkdir -p baileys_auth_info

EXPOSE 3000

CMD ["npm", "start"]
