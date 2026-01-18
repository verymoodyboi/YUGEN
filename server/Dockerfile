FROM node:20

RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    python3 \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpng-dev \
    libwebp-dev \
    libvips-dev \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV SHARP_IGNORE_GLOBAL_LIBVIPS=0
ENV SHARP_FORCE_GLOBAL_LIBVIPS=1

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# 🔑 THIS WAS MISSING
COPY . .

CMD ["npm", "run", "dev"]
