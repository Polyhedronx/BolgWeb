---
title: "Go + Gin 构建 RESTful API 入门"
date: "2026-06-12"
tags: ["Go", "Gin", "后端"]
category: "技术"
slug: "go-gin-intro"
description: "介绍如何使用 Go 语言和 Gin 框架快速构建 RESTful API 服务。"
---

## 为什么选择 Go 做后端？

Go 语言（Golang）由 Google 开发，具有以下优点：

- **编译型语言** — 编译成单一二进制文件，部署极其简单
- **并发原生支持** — goroutine 让高并发编程变得简单
- **静态类型** — 编译时发现错误，避免运行时问题
- **快速启动** — 冷启动通常在毫秒级
- **内存高效** — 垃圾回收，内存占用低

## 为什么选择 Gin？

Gin 是目前 Go 生态中最流行的 Web 框架：

```go
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    r.GET("/api/v1/posts", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Hello Blog!",
        })
    })
    r.Run(":8080")
}
```

只需几行代码就能启动一个 HTTP 服务。

## Gin 的核心特性

### 1. 路由分组

```go
v1 := r.Group("/api/v1")
{
    v1.GET("/posts", GetPosts)
    v1.GET("/posts/:slug", GetPost)
    v1.GET("/search", SearchPosts)
}
```

### 2. 中间件

```go
r.Use(cors.New(cors.Config{
    AllowOrigins: []string{"*"},
    AllowMethods: []string{"GET", "POST"},
}))
```

### 3. 优雅的错误处理

```go
c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
```

## 总结

Go + Gin 组合非常适合构建高性能的 API 服务。配合 PostgreSQL 和 Docker，可以快速搭建出生产级的后端服务。
