# API 文档

Base URL: `http://localhost:8080/api/v1`

所有需要认证的端点需携带 `Authorization: Bearer <token>` header。

---

## 文章

### `GET /posts`
文章列表（分页 + 可选过滤）

| 参数 | 类型 | 说明 |
|------|------|------|
| `page` | int | 页码，默认 1 |
| `limit` | int | 每页数量，默认 10，最大 50 |
| `tag` | string | 按标签筛选 |
| `category` | string | 按分类筛选 |

认证：可选。有 token 时根据角色过滤 premium 文章。

```json
// 200
{ "posts": [...], "total": 65, "page": 1, "limit": 10, "total_pages": 7 }
```

### `GET /posts/:slug`
文章详情

认证：可选。premium 文章非授权用户返回 403。

```json
// 200
{ "title": "...", "date": "2026-01-28", "tags": ["WSL2"], "category": "日常", "slug": "20260128", "description": "...", "content": "## 1. ..." }

// 403
{ "error": "该文章仅对高级用户开放" }

// 404
{ "error": "post not found" }
```

---

## 标签 & 分类

### `GET /tags`
```json
// 200
{ "tags": [{ "name": "Rust", "count": 18 }, ...] }
```

### `GET /categories`
```json
// 200
{ "categories": [{ "name": "日常", "count": 63 }, ...] }
```

---

## 搜索

### `GET /search?q=关键词`
全文搜索（大小写不敏感，搜索标题/描述/标签/正文）
返回结果包含内容片段 `snippet`，关键词用 `「」` 包裹供前端高亮。

```json
// 200
{
  "results": [
    {
      "title": "Go Web 框架入门",
      "date": "2026-06-10",
      "tags": ["Go", "Gin", "Web"],
      "category": "技术",
      "slug": "go-gin-intro",
      "description": "...",
      "snippet": "介绍了 Go 语言的 gin「Go」框架的基本用法和设计模式..."
    }
  ],
  "query": "Go"
}
```

---

## 评论

### `GET /comments?post_slug=xxx&sort=time|votes`
获取评论列表（树形结构）

```json
// 200
{
  "comments": [{
    "id": 7, "post_slug": "hello-world", "author_name": "Polyhedron",
    "content": "...", "upvote_count": 3, "downvote_count": 1,
    "created_at": "2026-06-12T12:59:14Z",
    "children": [{ "id": 8, ... }]
  }],
  "user_votes": { "7": "up" }
}
```

### `POST /comments`
发表评论（需登录）

```json
// Request
{ "post_slug": "hello-world", "content": "评论内容", "parent_id": 7 }
// parent_id 可选，有值时表示回复某评论

// 201
{ "comment": { "id": 22, ... } }

// 400 — 含敏感词
{ "error": "评论包含敏感词，请修改后提交" }
```

### `DELETE /comments/:id`
删除自己的评论（需登录）。管理员可删除任意评论。

```json
// 200
{ "message": "comment deleted" }
// 403
{ "error": "只能删除自己的评论" }
```

### `POST /comments/:id/vote`
投票（需登录）

```json
// Request
{ "vote_type": "up" }
// vote_type: "up" | "down"
// 再次投相同类型 = 取消投票

// 200
{ "comment": { "id": 7, "upvote_count": 4, "downvote_count": 0, ... } }
```

---

## 认证

### `POST /auth/register`
注册

```json
// Request
{ "username": "昵称", "email": "user@example.com", "password": "123456" }

// 201
{ "token": "eyJ...", "user": { "id": 2, "username": "昵称", "email": "...", "role": "user" } }

// 409
{ "error": "该邮箱已被注册" }
```

### `POST /auth/login`
登录

```json
// Request
{ "email": "admin@blog.com", "password": "admin123" }

// 200
{ "token": "eyJ...", "user": { "id": 1, "username": "Admin", "email": "...", "role": "admin" } }

// 401
{ "error": "邮箱或密码错误" }
```

### `GET /auth/me`
当前用户信息（需登录）

```json
// 200
{ "user": { "id": 1, "username": "Admin", "email": "...", "role": "admin" } }
```

---

## 管理（需 Admin 角色）

### `DELETE /admin/comments/:id`
管理员删除任意评论

### `GET /admin/comments/pending`
待审核评论列表

### `POST /admin/comments/:id/approve`
通过评论审核

### `POST /admin/comments/:id/reject`
拒绝并删除评论

---

## RSS & Sitemap

### `GET /rss`
RSS 2.0 Feed（`application/rss+xml`）

### `GET /sitemap.xml`
Sitemap XML

---

## 运维

### `POST /reload`
从磁盘重新加载 Markdown 文章

```json
// 200
{ "message": "posts reloaded" }
```

### `POST /webhook/github`
GitHub Webhook 端点，收到 push 事件自动 reload

### `GET /health`
```json
{ "status": "ok" }
```

---

## 认证说明

- JWT 有效期 7 天
- Token 存储于 `localStorage.token`
- 所有 API 请求自动附带 `Authorization` header（`frontend/src/lib/api.ts`）
- `AuthOptional` 中间件：有 token 则解析用户角色，无则静默继续
- `AuthRequired` 中间件：无有效 token 返回 401
