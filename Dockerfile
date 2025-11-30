# Multi-stage build for full-stack app
FROM node:20-alpine AS frontend

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files and config
COPY v0-design/package*.json ./
COPY v0-design/.nvmrc ./
COPY v0-design/tsconfig.json ./

# Install frontend dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy frontend source code
COPY v0-design/ ./

# Build the frontend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy built frontend
COPY --from=frontend /app/frontend/.next ./.next
COPY --from=frontend /app/frontend/public ./public
COPY --from=frontend /app/frontend/package*.json ./
COPY --from=frontend /app/frontend/node_modules ./node_modules

# Install production dependencies only
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
