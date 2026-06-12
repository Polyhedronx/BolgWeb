# Stage 1: Build React app
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

# 使用国内 npm 镜像
RUN npm config set registry https://registry.npmmirror.com && \
    npm ci

COPY . .

ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
