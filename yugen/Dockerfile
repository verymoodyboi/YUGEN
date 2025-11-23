# ---- Development Dockerfile for React (Vite) ----
FROM node:20-alpine

WORKDIR /usr/src/app

# Install deps
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server with host enabled
CMD ["npm", "run", "dev", "--", "--host"]
