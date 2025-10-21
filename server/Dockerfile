# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/src/*.js ./src/
COPY --from=builder /app/src/*.d.ts ./src/
COPY --from=builder /app/src/*.js.map ./src/

# Expose port
EXPOSE 4000

# Start the application with node directly
CMD ["node", "src/index.js"]
