# Frontend Dockerfile - Multi-stage build

# Stage 1: Build the React app
FROM node:18-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm i
# RUN npm ci

# Copy the entire frontend code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the built app with a lightweight web server
FROM node:18-alpine

WORKDIR /app

# Install serve package to serve the static files
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/build ./build

# Expose port 3000
EXPOSE 3000

# Start serving the app
CMD ["serve", "-s", "build", "-l", "3000"]
