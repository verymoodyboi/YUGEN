# ---- Base image ----
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files first (for build caching)
COPY package*.json ./

# Install all dependencies (not just prod, since TS needs dev deps for build)
RUN npm install

# Copy all project files
COPY . .

# Build TypeScript into dist/
RUN npm run build

# Expose port (matches your server.ts / env)
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

# Start the compiled app (same as your local npm start)
CMD ["npm", "start"]
