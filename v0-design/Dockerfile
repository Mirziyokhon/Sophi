FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Remove local-only env overrides so production build uses Cloud Run backend
RUN rm -f .env.local

# Build Next.js app
RUN npm run build

# Expose runtime port (Cloud Run will inject $PORT)
ENV PORT=8080
EXPOSE 8080

# Start Next.js in production mode, binding to the injected PORT
CMD ["sh", "-c", "npm run start -- --hostname 0.0.0.0 --port ${PORT:-8080}"]
