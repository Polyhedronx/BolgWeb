# BolgWeb

一个使用 **React + Go + PostgreSQL** 构建的个人博客网站，通过 Docker Compose 一键部署。

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 19 + TypeScript + Tailwind CSS v4 + React Router |
| 后端 | Go 1.25 + Gin + GORM |
| 数据库 | PostgreSQL 16 |
| 部署 | Docker Compose |

## 功能

- **Markdown 文章** — 以 `.md` 文件存储，Git 管理版本
- **标签 & 分类** — 从 frontmatter 解析
- **评论系统** — 支持嵌套回复
- **全文搜索** — 后端内存搜索
- **RSS 订阅** — 标准 RSS 2.0
- **Sitemap** — 自动生成

## 快速开始

### 前置要求

- [Docker](https://www.docker.com/) & Docker Compose

### 一键启动

```bash
# 克隆项目
git clone <your-repo-url> bolgweb
cd bolgweb

# 复制环境变量（可选，默认值已可用）
cp .env.example .env

# 启动所有服务
docker-compose up -d
```

启动后访问：

- **博客前台**: http://localhost
- **API 端点**: http://localhost:8080/api/v1/
- **RSS Feed**: http://localhost:8080/api/v1/rss

### 开发模式

```bash
# 后端 (需要本地 Go 1.25+)
cd backend
go run ./cmd/server

# 前端 (需要本地 Node.js 18+)
cd frontend
npm install
npm run dev
# 访问 http://localhost:3000 (API 自动代理到 :8080)
```

## 写文章

在 `content/posts/` 目录下创建 `.md` 文件，格式如下：

```markdown
---
title: "文章标题"
date: "2026-06-11"
tags: ["标签1", "标签2"]
category: "分类名"
slug: "article-slug"
description: "文章摘要"
---

正文内容（Markdown 格式）...
```

新文章添加后重启服务即可生效。

## 项目结构

```
BolgWeb/
├── docker-compose.yml       # 一键部署
├── content/posts/           # Markdown 文章
├── backend/                 # Go API 服务
│   ├── cmd/server/          # 入口
│   └── internal/            # 业务逻辑
├── frontend/                # React SPA
│   └── src/
│       ├── pages/           # 路由页面
│       └── components/      # 可复用组件
└── db/                      # 数据库初始化脚本
```

## 许可证

MIT
