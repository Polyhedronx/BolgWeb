---
title: "2026 年 2 月总结"
date: "2026-02-01"
tags: ["Linux", "Git", "Rust"]
category: "日常"
slug: "202602_summary"
description: "二月份主要学习 Rust 语言和 Git 操作，总结了开发环境配置的常用技巧。"
---

# 2026 年 2 月总结

---

## Linux / 开发环境配置

### 系统管理

- **Windows Defender 排除目录或进程** (`20260222`)
  - 排除编译目录减少扫描，提升编译速度
  - Get-MpPreference | Select-Object -ExpandProperty ExclusionPath 查看已排除目录
  - Add-MpPreference -ExclusionPath "D:\Projects" 添加排除目录
  - Add-MpPreference -ExclusionProcess "rustc.exe" 排除特定进程

---

## Git / GitHub

- **Git 撤回操作** (`20260201`)
  - git checkout . 丢弃工作区所有更改
  - git reset HEAD . 丢弃暂存区所有更改
  - git reset --soft HEAD^ 回退一次 commit

- **Github 仓库拒绝 SSH 连接** (`20260224`)
  - 检查 git config：git config --global --get-regexp url
  - 移除全局 SSH 替换：git config --global --unset url.git@github.com:.insteadOf
  - 按仓库单独配置：git config --global url."git@github.com:name/".insteadOf "https://github.com/name/"

---

## Rust 语言

### 基础语法

- **Tuple 和 Array** (`20260202`)
  - Tuple：使用点标记法访问，如 tup.0, tup.1
  - Array：存放在栈内存，类型为 [T; n]，长度也是类型的一部分
  - 数组初始化：[初始值; 长度]，如 [3;5] 等效于 [3,3,3,3,3]
  - 数组复制：std::array::from_fn(|_i| String::from("hello"))

- **变量遮蔽 (Shadowing)** (`20260202`)
  - 使用 let 遮蔽可改变变量类型
  - 不同于 mut：mut 只能改变值，不能改变类型

- **语句和表达式** (`20260202`)
  - 语句执行操作但不返回值
  - 表达式有返回值，函数最后一个表达式即返回值
  - if 是表达式，可用于 let 右侧，但各分支类型必须一致

- **循环标签** (`20260202`)
  - 使用 'label 标记循环：'counting_up: loop { ... break 'counting_up; }
  - 可从多层循环中精准跳出到指定位置

### 所有权与内存

- **变量移动与 Clone** (`20260202`, `20260205`)
  - 移动：赋值给另一变量时原变量失效（类似浅拷贝但使原变量无效）
  - Clone：深拷贝，需要显式调用 .clone()
  - Copy trait：简单类型（整数、布尔、浮点、字符、元组）自动实现
  - .clone() 后原变量仍可用，适用于需要保留原值的场景

- **引用作用域规则** (`20260211`)
  - 新编译器：引用作用域在最后一次使用处结束，而非花括号
  - 不可变引用后可创建可变引用（前提是不可变引用已结束）

### 核心概念

- **结构体** (`20260203`)
  - 实例必须整体可变，不能只标记某字段可变
  - 使用 ..user1 语法从另一实例复制其余字段
  - 结构体中的引用需要指定生命周期

- **Enum 与模式匹配** (`20260211`, `20260213`)
  - 无字段枚举默认有整数 discriminant，可通过 as 转换
  - matches! 宏：matches!(x, MyEnum::Foo) 返回布尔值
  - @ 模式：匹配同时绑定变量，如 id_variable @ 3..=7
  - Match 所有分支必须穷尽，使用 _ 捕获剩余情况

- **Match 控制流** (`20260206`)
  - other 分支捕获所有未匹配值
  - _ 分支不绑定值，用于忽略

- **if let 简化** (`20260210`)
  - 当只需要匹配一个模式时，用 if let 替代 match
  - if let 模式 = 表达式：模式在左，数据在右

- **可变引用注意事项** (`20260213`)
  - 模式 &mut V 匹配可变引用时，V 是值而非可变引用

- **关联函数** (`20260213`)
  - 定义在 impl 中但没有 self 参数的函数
  - 用 :: 调用，如 String::from，Rectangle::new
  - new 是约定俗成的构造器名称

### 集合类型

- **Vector** (`20260205`)
  - v.get(index) 返回 Option<&T>，访问越界返回 None
  - v[index] 访问越界会 panic
  - 不能同时存在可变和不可变引用
  - push 可能导致重新分配，原有引用可能失效

- **String 类型** (`20260206`)
  - push_str 采用字符串 slice，不获取所有权
  - + 运算符：String + &str，会移动 String
  - format! 宏：级联多个字符串，不获取所有权
  - String 有指针、长度、容量三个字段；&str 只有指针和长度

- **&str 和 &String** (`20260211`)
  - 函数参数优先使用 &str：可接受 String、字面量、切片
  - &String 会自动 Deref 强制转换为 &str
  - &str 可指向堆（来自 String）或静态内存（字面量）

### 迭代器与闭包

- **iter() 和 enumerate()** (`20260210`, `20260212`)
  - iter() 创建不可变迭代器 Iterator<Item=&T>，借用而非获取所有权
  - enumerate() 为迭代器附加索引，产出 (索引, 引用) 元组
  - for (i, v) in a.iter().enumerate()

- **.entry() API** (`20260209`)
  - 声明式语义：entry(key).or_insert(value)
  - 原子操作：检查存在 + 插入 = 一步完成，无竞态条件

### 模块系统

- **use 关键字** (`20260207`, `20260208`)
  - use std::time::{SystemTime, UNIX_EPOCH} 使用树状结构分组导入
  - pub use 对外暴露 API，支持重命名 as
  - mod 声明模块，pub 暴露公共接口

- **模块设计最佳实践：门面模式** (`20260208`)
  - lib.rs：creat 根，使用 mod 声明模块，pub use 定义公共 API
  - 门面文件（如 http.rs）：聚合子模块，统一暴露
  - 子模块文件（如 http/request.rs）：实现细节
  - 核心原则：修改局部化，影响半径可预测

### 调试与开发

- **Debug 输出** (`20260204`)
  - 结构体需加 #[derive(Debug)]
  - {:?} 调试格式，{:#?} 美化输出
  - dbg!(&var) 宏输出变量位置和值，会获取所有权

- **rust-analyzer 问题解决** (`20260211`)
  - 遇到 Panic 可尝试降级插件版本
  - Ctrl+Shift+P → Rust Analyzer: Restart Server

### 工具链

- **Cargo 基本操作** (`20260201`)
  - cargo new 创建项目，cargo run 编译运行
  - cargo check 仅检查编译，不生成文件
  - cargo build --release 发布构建

- **Rustup 切换工具链** (`20260202`)
  - 安装 GNU 工具链：rustup toolchain install stable-x86_64-pc-windows-gnu
  - 设为默认：rustup default stable-x86_64-pc-windows-gnu
  - 配置国内镜像：在 ~/.cargo/config.toml 设置清华源

- **cargo.toml 依赖版本** (`20260201`)
  - "0.8.5" 等效于 "^0.8.5"，表示 >=0.8.5 且 <0.9.0

---

## Python

- **uv 管理 Python 环境** (`20260201`)
  - uv venv 创建虚拟环境（自动创建 .venv 目录）
  - uv pip install 安装包，支持 -r requirements.txt
  - .venv\Scripts\activate.ps1 激活环境（Windows）

---

## 杂项

- **Git 配置 SSH 代理问题** (`20260224`)
  - 记录了解决 Github 仓库拒绝 SSH 连接的方法

- **卖游戏本文案** (`20260222`)
  - 记录了机械革命耀世15Pro 笔记本的转卖信息

- **Unit 类型** (`20260211`)
  - () 类型占用 0 字节内存
