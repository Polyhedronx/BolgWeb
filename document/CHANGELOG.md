# Changelog

## v0.7.1 — 站点图标更新 (2026-06-13)

### 变更
- `frontend/public/favicon.svg`：将默认字母图标替换为项目 Logo（Logo.png → 256×256 嵌入 SVG）

---

## v0.7.0 — 搜索增强 (2026-06-13)

### 内容预览
- 搜索结果从纯标题列表升级为**列表式预览卡片**
- 后端提取正文中匹配关键词的前后各 80 字符作为上下文片段
- 关键词用 `「」` 标记，前端渲染为 `<mark>` 荧光高亮（亮色黄底 / 暗色棕底）
- 非正文匹配时（标题/标签/分类）显示对应标签
- 不再显示 `description` 字段，只展示正文片段

### 新增
- `backend/internal/model/post.go` — `SearchResultItem` 模型（含 `snippet` 字段）
- `frontend/src/components/post/SearchResultCard.tsx` — 列表式搜索卡片组件

---

## v0.6.1 — 关于页 (2026-06-13)

### 新增
- **关于页 `/about`**：个人卡片（头像/姓名/简介/社交链接/技能标签） + Markdown 正文
- 内容来源 `content/about.md`（YAML frontmatter），修改后重新部署即可生效
- 后端 `GET /api/v1/about` 端点，容错处理（文件缺失/格式错误不 crash）
- 前端 `AboutPage`（React.lazy 懒加载），完整 SEO（OG + JSON-LD Person schema）
- Header 添加「关于」导航链接（桌面端可见）
- Sitemap 添加 `/about` URL

### 移除
- 笔记功能规划（不再实施）

---

## v0.6.0 — SEO 优化 (2026-06-13)

### OpenGraph 标签
- 文章详情页：`og:title`, `og:description`, `og:type=article`, `og:url`, `og:site_name`, `og:locale`
- 文章详情页：`article:published_time`, `article:tag`（每个标签一个 meta）
- 首页：`og:type=website` 全套 OG 标签
- 搜索页 / 404 页添加 `meta robots=noindex` 防止索引

### Twitter Card
- 文章详情页添加 `twitter:card=summary`, `twitter:title`, `twitter:description`

### JSON-LD 结构化数据
- 文章详情页：`BlogPosting` schema（headline, description, datePublished, url, author, keywords）
- 首页：`WebSite` schema（含 SearchAction 搜索入口）+ `Blog` schema

### Canonical URL
- 文章详情页 / 首页均添加 `<link rel="canonical">` 标签
- 使用 `window.location.origin` 动态构建完整 URL

### 其他
- Login / Register / 404 页面添加 `<title>` Helmet 标签
- 所有页面统一使用 `react-helmet-async` 管理 `<head>`

---

## v0.5.4 — LaTeX 公式支持 (2026-06-13)

### KaTeX 数学渲染
- 安装 `remark-math` + `rehype-katex`，支持 `$...$` 行内和 `$$...$$` 块级公式
- 超长公式自动横向滚动（`.katex-display { overflow-x: auto }`）
- 暗色模式 KaTeX 字体色适配

---

## v0.5.3 — 暗色主题 (2026-06-13)

### Google Material 暗色规范
- 文本/按钮色彩分离：`--color-primary` 纯文本、`--color-accent` 纯按钮背景
- 暗色正文 `#f1f5f9`（15:1 AAA 对比度），粗体/标题 `#f8fafc`
- 按钮白字搭配 accent `#f4727a`，亮暗模式均清晰可读
- prose 区域：标题、粗体、链接、引用、代码块全量适配
- `ThemeProvider` + `useTheme` hook，默认跟随系统、手动切换存 localStorage

---

## v0.5.2 — 移动端响应式修复 (2026-06-12)

### 内容溢出修复
- `.prose img` 添加 `max-width: 100%; height: auto`（图片不再超出屏幕）
- `.prose table` 添加 `display: block; overflow-x: auto`（宽表格可横向滚动）
- `.prose a` 添加 `word-break: break-all`（长 URL 自动断行）
- 文章卡片标题/描述、评论区正文添加 `break-words`

### 响应式优化
- 移除 `prose-lg`，移动端字号缩小（正文 0.9375rem，标题等比缩放）
- 代码块 padding 和字号在移动端缩小
- 搜索框宽度改为 `w-28 xs:w-36 sm:w-48` 三档自适应
- 评论操作按钮行添加 `flex-wrap` 防止重叠

---

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

## v0.5.0 — 评论系统升级 (2026-06-12)

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

## v0.4.0 — 内容可见性 (2026-06-12)

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

## v0.3.0 — 用户认证 (2026-06-12)

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

## v0.2.0 — 前端设计重塑 (2026-06-12)

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

## v0.1.0 — MVP (2026-06-11)

### 技术栈
React 19 + TypeScript + Tailwind CSS v4 / Go + Gin + GORM / PostgreSQL 16 / Docker Compose

### 功能
- Markdown 博客文章（YAML frontmatter，Git 管理）
- 标签/分类筛选、全文搜索
- 评论系统（嵌套回复）
- RSS 2.0 + Sitemap 自动生成
- Docker Compose 一键部署
