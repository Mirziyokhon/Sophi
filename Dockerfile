# Multi-stage build for full-stack app
FROM node:20-alpine AS frontend

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY v0-design/package*.json ./
COPY v0-design/.nvmrc ./

# Install frontend dependencies
RUN npm ci --only=production

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
