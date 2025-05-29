# Stage 1: Install dependencies
FROM node:23-alpine AS deps
WORKDIR /app
# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:23-alpine AS builder
WORKDIR /app
# Copy the entire repository (ensure .dockerignore is not excluding needed files)
COPY . .
# Copy node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
# Build the Next.js app (this creates the .next folder)
RUN npm run build

# Stage 3: Production Image with PM2 (final image)
FROM node:23-alpine AS runner
WORKDIR /app

# Install PM2, ts-node, and tsconfig-paths globally
RUN npm install -g pm2 ts-node tsconfig-paths

# Set production environment
ENV NODE_ENV=production

# Copy built assets and static files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy package files and node_modules from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy the complete src folder (including generated gRPC files)
COPY --from=builder /app/src ./src

# Copy additional configuration files required at runtime
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Copy the PM2 ecosystem file
COPY ecosystem.config.js ./

# Expose ports: 3000 for Next.js and 3001 for the WebSocket server
EXPOSE 3000 3001

# Start both processes using PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
