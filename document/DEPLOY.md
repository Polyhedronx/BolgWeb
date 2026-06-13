# 部署与运维

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DB_HOST` | `localhost` | 数据库地址（Docker 内为 `postgres`） |
| `DB_PORT` | `5432` | 数据库端口 |
| `DB_USER` | `blog` | 数据库用户 |
| `DB_PASSWORD` | `blog123` | 数据库密码 |
| `DB_NAME` | `blog` | 数据库名 |
| `SERVER_PORT` | `8080` | 后端端口 |
| `CONTENT_PATH` | `./content` | 文章目录 |
| `ADMIN_EMAIL` | `admin@blog.com` | 管理员邮箱 |
| `ADMIN_PASSWORD` | `admin123` | 管理员初始密码（首次启动生效） |
| `JWT_SECRET` | `change-me` | JWT 签名密钥 |
| `FRONTEND_PORT` | `80` | 前端端口 |
| `VITE_API_BASE_URL` | `/api/v1` | 前端 API 前缀 |

全部在 `.env` 文件中配置，`.gitignore` 已排除不提交。

## Docker Compose 命令

```bash
# 启动（首次或更新后）
docker compose up -d

# 仅重建后端
docker compose build --no-cache backend
docker compose up -d --force-recreate backend

# 仅重建前端
docker compose build frontend
docker compose up -d --force-recreate frontend

# 全部重建
docker compose build --no-cache
docker compose up -d --force-recreate

# 查看日志
docker logs blog-backend
docker logs blog-frontend

# 停止
docker compose down
```

## 服务架构

```
浏览器 :80 → nginx (frontend)
                ├── /api/*  → backend:8080 (Go)
                └── /*      → 静态文件 (React SPA)

backend:8080 → postgres:5432
             → content/ (bind mount，文章文件)
```

## GitHub Webhook

1. GitHub 仓库 → Settings → Webhooks → Add webhook
2. Payload URL：`http://你的服务器IP:8080/api/v1/webhook/github`
3. Content type：`application/json`
4. 选择 `Just the push event`
5. 每次 push 自动 reload 文章

## 文章 Reload

```bash
# 手动触发
curl -X POST http://localhost:8080/api/v1/reload

# Docker 内
docker exec blog-backend wget -qO- --post-data='' http://localhost:8080/api/v1/reload
```

## 数据库

```bash
# 进入 PostgreSQL
docker exec -it blog-postgres psql -U blog -d blog

# 常用查询
SELECT COUNT(*) FROM comments;
SELECT id, email, role FROM users;
```

### 备份
```bash
docker exec blog-postgres pg_dump -U blog blog > backup.sql
```

### 恢复
```bash
docker exec -i blog-postgres psql -U blog -d blog < backup.sql
```

## 重置管理员密码

```bash
# 进入数据库
docker exec -it blog-postgres psql -U blog -d blog

# 删除现有管理员（重启后自动用 .env 中的密码重新创建）
DELETE FROM users WHERE role = 'admin';

# 重启后端
docker compose restart backend
```

## 本地开发

```bash
# 后端（需本地 Go + PostgreSQL）
cd backend
go run ./cmd/server

# 前端（需 Node.js）
cd frontend
npm install
npm run dev        # :3000，/api 代理到 :8080
```
