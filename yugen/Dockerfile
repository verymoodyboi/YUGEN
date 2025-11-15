# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Build the production-ready static site
RUN npm run build

# ---------- Serve stage ----------
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx files
RUN rm -rf ./*

# Copy built Vite output from the builder
COPY --from=builder /usr/src/app/dist ./

# Expose the nginx port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
