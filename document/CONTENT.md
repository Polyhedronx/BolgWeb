# 内容写作指南

## 文章类型与目录

| 目录 | 分类 | URL 格式 | 说明 |
|------|------|---------|------|
| `content/posts/tech/` | 技术 | `/tech/:slug` | 技术文章、教程 |
| `content/posts/essay/` | 随笔 | `/essay/:slug` | 随笔、杂谈 |
| `content/posts/daily/` | 日常 | `/daily/:year/:month/:dateSlug` | 每日笔记 |

## Frontmatter 规范

```yaml
---
title: "文章标题"         # 必填
date: "2026-06-12"        # 必填，YYYY-MM-DD
tags: ["Go", "后端"]      # 必填，2-4 个宽泛标签
category: "技术"          # 必填，技术/随笔/日常
slug: "hello-world"       # 必填，URL 标识，全局唯一
description: "文章摘要"   # 必填，SEO 描述
visibility: public        # 可选，public（默认）/ premium
---
```

### 字段说明

- **slug**：唯一标识，英文/数字/连字符，全局不可重复。daily 用日期数字（如 `20260612`），tech/essay 用可读英文
- **category**：决定 URL 前缀和首页分类按钮，目前仅支持 技术/随笔/日常
- **visibility**：省略默认为 `public`；`premium` 仅管理员和高级用户可见
- **tags**：3-4 个宽泛标签，禁止使用完整句子做标签

## 标签词汇表

从以下 28 个标准标签中选择，不要新建：

| 类别 | 可用标签 |
|------|---------|
| 语言 | Rust, C++, Python, SQL |
| 系统 | Linux, Shell, WSL2, Windows |
| 工具 | Git, GitHub, SSH, Vim, Neovim, Tmux, RegEx, Claude Code |
| 数据库 | PostgreSQL |
| 算法 | 算法, LeetCode |
| 学习 | CSAPP, 学校, 课程, 考试 |
| 生活 | 杂谈, 游戏, 工具推荐 |

## Daily 文章规范

- 文件名：`YYYYMMDD.md`（如 `20260612.md`）
- 标题：`"20260612"`
- slug：与文件名一致
- category：`"日常"`
- 月末总结：`YYYYMM_summary.md`，标题 `"2026 年 X 月总结"`

## 发布流程

```
1. 在对应目录创建/修改 .md 文件
2. 填写正确的 frontmatter
3. git add + commit + push
4. GitHub Webhook 自动触发后端 reload
   （手动触发：POST /api/v1/reload）
```
