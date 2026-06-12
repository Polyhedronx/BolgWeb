---
title: "2026 年 3 月总结"
date: "2026-03-01"
tags: ["Linux", "PostgreSQL", "Rust"]
category: "日常"
slug: "202603_summary"
description: "三月份重点学习了 PostgreSQL 数据库和 LeetCode 算法题，继续深入 Rust。"
---

# 2026 年 3 月总结

---

## Linux / 开发环境配置

### PowerShell

- **环境变量查找** (`20260304`)
  - $env:PATH -split ';' | Where-Object {$_ -like '*cargo*'}
  - -split 按字符分割，类似 Python 的 split
  - $_ 表示当前处理的行，类似 bash 的 xargs

### Bash / AWK

- **统计词频** (`20260311`)
  - cat words.txt | tr -s ' ' '\n' | sort | uniq -c | sort -nr | awk '{ print $2, $1 }'
  - tr -s 缩减连续字符为单个字符
  - sort -nr 按数字倒序（超过10需要 -n 参数）
  - awk 格式化输出，调整列顺序

- **AWK 内置变量** (`20260312`)
  - NF：当前行的字段数（列数）
  - NR：当前已处理的记录数（行号）
  - OFS：输出字段分隔符（默认空格）
  - FS：输入字段分隔符
  - RS：输入记录分隔符（默认换行）
  - ORS：输出记录分隔符（默认换行）
  - $i：动态引用第 i 个字段

- **AWK 转置文件** (`20260312`)
  - 使用二维数组 data[NR, i] 存储数据
  - 用 NR 和 NF 动态确定行列数

---

## PostgreSQL / 数据库

### 基础查询

- **自联表与聚合** (`20260306`)
  - 通过 JOIN 将同一表的不同行合并，便于计算差值
  - 示例：Activity 表通过 machine_id 和 process_id 自联，计算 start 和 end 的时间差

- **CROSS JOIN 笛卡尔积** (`20260306`)
  - 用于生成所有用户与所有科目的组合
  - 再 LEFT JOIN 实际考试记录，实现"即使没考也显示"的格式

- **COALESCE 函数** (`20260308`)
  - 从左到右返回第一个非 NULL 值
  - 等效于 IFNULL()，但可接受多个参数
  - 常用于处理数值运算中的 NULL：COALESCE(discount, 0)

- **CASE 语句** (`20260309`)
  - COUNT(CASE WHEN state = 'approved' THEN 1 END)
  - 满足条件返回 1，不满足返回 NULL
  - COUNT 和 SUM 忽略 NULL 值

### 窗口函数

- **ROW_NUMBER()** (`20260311`)
  - ROW_NUMBER() OVER (PARTITION BY col ORDER BY col DESC) AS rk
  - 产生连续不重复的序号
  - 用于取每组前 N 条、去重、分页

- **RANK 和 DENSE_RANK** (`20260316`)
  - RANK()：重复序号，会跳号
  - DENSE_RANK()：重复序号，不跳号
  - 示例：部门工资前三高，DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)

- **RANGE BETWEEN** (`20260316`)
  - RANGE BETWEEN interval '6 days' PRECEDING AND CURRENT ROW
  - UNBOUNDED PRECEDING/FOLLOWING：从头/到尾
  - N PRECEDING/FOLLOWING：前/后 N 行
  - 常用于计算移动平均、移动总和

### 高级特性

- **FILTER 子句** (`20260308`)
  - SUM(amount) FILTER (WHERE YEAR >= 1960 AND YEAR < 1970)
  - 比 CASE WHEN 更简洁，可读性更好

- **STRING_AGG 字符串聚合** (`20260318`)
  - 等效于 MySQL 的 GROUP_CONCAT
  - STRING_AGG(name, ',' ORDER BY score DESC)
  - 支持函数内排序，支持 DISTINCT 去重
  - 可配合 CONCAT 格式化拼接

- **子查询优化** (`20260309`)
  - 优先使用非相关子查询，性能更好
  - 相关子查询可改写为 JOIN 或窗口函数
  - WITH ... AS 可将子查询提取为命名表，提高可读性

### 字符串处理

- **CONCAT 和 ||** (`20260317`)
  - CONCAT()：忽略 NULL 参数
  - ||：任一参数为 NULL 则结果为 NULL
  - CONCAT_WS(', ', a, b)：带分隔符拼接，忽略 NULL

- **SUBSTRING()** (`20260317`)
  - SUBSTRING(string FROM start FOR length)
  - 或 SUBSTRING(string, start, length)
  - 支持负数索引从末尾计算

### 正则表达式

- **PostgreSQL 正则运算符** (`20260317`)
  - ~：匹配，~*：不区分大小写匹配
  - !~：不匹配，!~*：不区分大小写不匹配

- **正则函数** (`20260317`)
  - regexp_replace(str, pattern, replacement)
  - substring(str FROM pattern)：提取匹配的子字符串

### SQL 执行顺序

```mermaid
graph LR
    A[FROM/JOIN] --> B[WHERE]
    B --> C[GROUP BY]
    C --> D[HAVING]
    D --> E[SELECT]
    E --> F[DISTINCT]
    F --> G[ORDER BY]
    G --> H[LIMIT/OFFSET]
```

- WHERE 不能使用聚合函数或别名
- HAVING 可使用聚合函数
- 窗口函数在 SELECT 中计算，但逻辑上在 ORDER BY 之前

---

## Rust 语言

### 算法实现

- **异位数分组（双哈希）** (`20260319`)
  - 每个字母分配不同质数，相乘得到乘积
  - 使用两个大质数取模得到 (hash1, hash2) 双哈希标识
  - 比排序方法时间复杂度更低

- **双指针算法** (`20260320`)
  - 接雨水：谁矮动谁，维护左右最大高度
  - 三数之和：排序后双指针，剪枝优化
  - 盛最多水：双指针向中间收敛

- **滑动窗口** (`20260321`)
  - 字母异位词：维护 count 数组，diff 变量统计非零元素个数
  - 当 diff == 0 时窗口匹配
  - 相比逐个比对词频数组更高效

### 迭代器

- **iter() 和 enumerate()** (`20260321`)
  - iter() 创建不可变迭代器，仅借用元素
  - enumerate() 包装元组 (索引, 引用)
  - 两者组合是遍历并获取索引的标准方式

---

## 算法

### 双指针

- **接雨水** (`20260320`)
  - 时间复杂度 O(n)，空间复杂度 O(1)
  - 每次移动较短一侧的指针

- **三数之和** (`20260320`)
  - 排序后固定一个数，双指针找两数之和等于其相反数
  - 使用 match cmp(&target) 而非 if-else 更 Rust 风格

- **盛最多水的容器** (`20260320`)
  - 双指针向内收敛，移动较短边

### 滑动窗口

- **找到字符串中所有字母异位词** (`20260321`)
  - 窗口词频与目标词频方向相反累加
  - diff 统计词频数组中非零元素数量

### 哈希表

- **前缀和哈希表** (`20260322`)
  - 用于"和为 K 的子数组"类问题
  - 前缀和 sum，若存在 sum - k，则找到满足条件的子数组
  - 使用 HashMap 存储前缀和出现次数（处理负数情况）
  - 初始化 prefix.insert(0, 1) 处理从开头开始的子数组

---

## 杂项

- **广州大学生医保使用指南** (`20260304`)
  - 华工无定点医院，自费后回校报销
  - 每月14号早上（大学城校区）为统一报销时间
  - 需准备：发票、费用明细清单、转诊单（如需要）
  - 急诊可不凭转诊单
