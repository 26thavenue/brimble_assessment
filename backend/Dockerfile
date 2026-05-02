FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y \
    git \
    curl \
    jq \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /tmp/railpack \
    && RAILPACK_URL=$(curl -sL https://api.github.com/repos/railwayapp/railpack/releases/latest | jq -r '.assets[] | select(.name | test("x86_64.*linux")) | .browser_download_url') \
    && curl -fsSL "$RAILPACK_URL" -o /tmp/railpack/railpack.tar.gz \
    && tar -xzf /tmp/railpack/railpack.tar.gz -C /tmp/railpack \
    && find /tmp/railpack -name "railpack" -type f -executable -exec mv {} /usr/local/bin/railpack \; \
    && chmod +x /usr/local/bin/railpack \
    && rm -rf /tmp/railpack

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3002

CMD ["node", "dist/index.js"]
