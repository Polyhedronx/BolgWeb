# Changelog

## v0.5.1 — 路由精简 & 修复 (2026-06-12)

### 移除冗余路由
- 删除 `/tags` 及 `/tags/:tag` 路由（标签筛选已集成至首页下拉）
- 文章标签链接统一跳转 `/?tag=xxx`

### Bug 修复
- 标签下拉选择后未实际筛选文章（`tag` 参数未传入 `getPosts()`）
- 分页/切分类时 `tag` 参数丢失

### 文档
- 新增 `document/CHANGELOG.md`、`DESIGN.md`、`API.md`、`CONTENT.md`、`DEPLOY.md`

---

## v0.5 — 评论系统升级 (2026-06-12)

### 评论交互重构
- **登录才能评论**：未登录显示去登录引导，去除匿名评论
- **后期审核**：评论直接显示，管理员可删除（红色垃圾桶图标）；用户可删除自己评论
- **点赞/点踩**：`comment_votes` 表防止重复投票；按赞同数排序
- **敏感词过滤**：后端维护敏感词列表，命中拒绝提交

### 交互规范统一
- **三级中性灰体系**：L1(#1a1a2e)正文/用户名、L2(#6b7280)默认图标、L3(#9ca3af)时间戳
- **语义色**：主色(#e94560)仅点赞激活/OP标签、警示红(#ef4444)仅点踩激活
- **操作按钮**：线性图标+尾部数字、hover灰底、点击缩放动效、2rem最小热区
- **间距层级**：头像↔正文、正文↔操作栏间距逐级增大；评论间1px分隔线
- **回复计数**：回复按钮显示子评论数量

### Bug 修复
- 评论树构建顺序导致子回复不显示（两趟遍历修复）
- 点赞数未持久化到数据库（原子 UpdateColumn 修复）
- 抽屉打开时页面因滚动条消失偏移（scrollbar-gutter: stable 修复）
- 分类切换时 indicator bar 导致布局跳动

---

## v0.4 — 内容可见性 (2026-06-12)

### 文章可见性
- frontmatter 新增 `visibility` 字段：`public`（默认）、`premium`
- 未登录/普通用户看不到 premium 文章，直接访问返回 403
- 高级用户和管理员可查看所有文章
- 后端 `PostService` 递归扫描 `content/posts/` 子目录

### 自动更新
- `POST /api/v1/webhook/github` 端点：收到 push 事件自动 reload 文章
- 替代手动 `curl POST /api/v1/reload`

### 内容整理
- 60+ 个 daily 文章批量补全标准化 frontmatter
- 统一标签词汇表（28 个宽泛标签）

---

## v0.3 — 用户认证 (2026-06-12)

### 账号系统
- 自建 `users` 表 + bcrypt 密码 + JWT 认证（7 天过期）
- 三种角色：admin / user / premium
- 注册自动登录；抽屉显示用户头像/昵称/角色

### 管理员
- 首次启动从环境变量 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 自动创建
- 已存在则跳过，不重复创建

### API
- `POST /api/v1/auth/register`、`/login`、`GET /auth/me`
- `AuthRequired` 中间件（必须登录）+ `AuthOptional`（有 token 则解析）

---

## v0.2 — 前端设计重塑 (2026-06-12)

### 页面重构
- 首页：三分类按钮（全部/技术/随笔/日常）+ 标签下拉 + 分页器
- 分类前缀 URL：`/tech/:slug`、`/essay/:slug`、`/daily/:year/:month/:dateSlug`
- Header：移除标签链接，齿轮图标触发侧边抽屉
- 搜索框统一到 Header，去除首页重复搜索框

### 组件新增
- 首字母头像（CSS hash 配色，零网络请求，Gravatar 异步兜底）
- 右侧滑出抽屉（用户信息 + 主题切换 + 登录/退出）

### 性能
- 路由级代码分割（React.lazy）+ vendor chunk 拆分
- 首页 JS 从 614KB → ~290KB（gzip ~180KB → ~95KB）

---

## v0.1 — MVP (2026-06-11)

### 技术栈
React 19 + TypeScript + Tailwind CSS v4 / Go + Gin + GORM / PostgreSQL 16 / Docker Compose

### 功能
- Markdown 博客文章（YAML frontmatter，Git 管理）
- 标签/分类筛选、全文搜索
- 评论系统（嵌套回复）
- RSS 2.0 + Sitemap 自动生成
- Docker Compose 一键部署
