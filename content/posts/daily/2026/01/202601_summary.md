---
title: "2026 年 1 月总结"
date: "2026-01-01"
tags: ["Linux", "Git", "杂项"]
category: "日常"
slug: "202601_summary"
description: "一月份学习了 Linux 基础操作、Git 版本控制等内容。"
---
# 2026 年 1 月总结

---

## Linux / 开发环境配置

### Linux 工具

- **tmux 终端复用** (`20260128`)
  - 会话 Session → 窗口 Windows → 窗格 Pane 的三层结构
  - 所有快捷键需先按 Ctrl+b（Prefix）唤起
  - Prefix+d 脱离会话（后台运行），tmux ls 查看所有会话
  - 支持左右分屏（Prefix+%）、上下分屏（Prefix+"）
  - 鼠标模式：在 ~/.tmux.conf 添加 `set -g mouse on`

- **Vim 常用操作** (`20260128`, `20260130`)
  - 普通模式：gg 跳行首，G 跳行尾，dd 剪切，yy+p 复制粘贴
  - /关键词 搜索，n 跳转下一个匹配项
  - esc 后 :wq 保存退出，q! 不保存退出
  - :set paste / :set nopaste 粘贴前后使用防止乱码
  - vim-plug 安装插件：curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
  - 一键安装 vimrc：git clone --depth=1 https://github.com/amix/vimrc.git ~/.vim_runtime && sh ~/.vim_runtime/install_basic_vimrc.sh

- **fzf 模糊搜索** (`20260129`)
  - Ctrl+r 命令历史搜索，Ctrl+t 文件模糊匹配，Alt+c 目录跳转
  - 搜索技巧：精确匹配 `'abc'`，反向匹配 `!abc`，开头 `^abc`，结尾 `abc$`
  - 组合用法：ps -ef | fzf 查进程，vim $(fzf) 快速打开文件

### Shell 脚本与命令

- **正则表达式基础** (`20260131`)
  - \d = [0-9]，\w = [a-zA-Z0-9_]，\s = 空白字符
  - 量词：+（1-n次），*（0-n次），?（0-1次），{n,m}（n-m次）
  - 边界：^开头，$结尾，\b 单词边界
  - 分组：(ab){2} 匹配 abab，$1 引用分组

- **重定向和管道** (`20260131`)
  - `>` 覆盖写入，`>>` 追加写入，`2>` 重定向错误输出
  - `command > output.log 2>&1` 将标准输出和错误输出合并
  - `|` 管道：将前一个命令的 stdout 作为下一个命令的 stdin

- **通配符** (`20260131`)
  - `*` 匹配所有，`?` 匹配单个字符，`[]` 字符集合
  - ls [a-z].txt 匹配单字母命名的 .txt 文件

- **Shell 引用规则** (`20260131`)
  - 单引号：原样输出，不处理任何特殊字符
  - 双引号：允许变量替换 $VAR 和命令替换 $(cmd)
  - 反斜杠：转义字符

- **Bash 脚本管理** (`20260128`)
  - 脚本放 ~/scripts 或 /usr/local/bin，加入 PATH
  - 脚本不带 .sh 后缀，需 chmod +x 赋予执行权限
  - 使用 case 语句写入口脚本统一管理多个脚本

### 系统管理

- **软链接用法** (`20260129`)
  - ln -s <源文件绝对路径> <链接名>
  - 查看：ls -l，find . -type l

- **环境变量配置** (`20260129`)
  - 普通用户：vim ~/.bashrc，export PATH="$HOME/.local/bin:$PATH"
  - root 用户：优先使用软链接指向 /usr/local/bin

- **Linux 文件系统 FHS 标准** (`20260129`)
  - /bin, /usr/bin：用户命令，/sbin, /usr/sbin：系统管理命令
  - /etc：配置文件，/home：用户目录，/opt：第三方软件
  - /var：可变数据（/var/log 日志），/tmp：缓存（重启清空）
  - /proc, /sys, /dev：虚拟文件系统

- **权限管理** (`20260131`)
  - chown 改拥有者，chmod 改权限
  - 数字法：r=4, w=2, x=1，chmod 755 filename
  - 符号法：u+x, g-r, o=w

### 包管理器

- **brew (Linuxbrew)** (`20260130`)
  - 安装：/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  - 添加到 PATH：(echo; echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"') >> ~/.bashrc
  - 常用命令：brew install, brew upgrade, brew uninstall, brew list, brew cleanup

- **WSL2 配置** (`20260130`)
  - 配置文件：~/.wslconfig
  - 关键配置：nestedVirtualization=true（嵌套虚拟化），networkingMode=mirrored（端口共享），dnsTunneling=true（VPN DNS），autoMemoryReclaim=gradual（内存回收）

---

## Git / GitHub

- **Gitconfig 管理** (`20260131`)
  - git config --global --edit 编辑全局配置
  - git config --list --show-origin 查看所有配置及来源

- **SSH-Agent 配置（Windows）** (`20260131`)
  - Start-Service ssh-agent 启动 SSH Agent
  - ssh-add $HOME\.ssh\id_ed25519 添加密钥
  - git config --global core.sshCommand C:/Windows/System32/OpenSSH/ssh.exe 强制 Git 使用 OpenSSH

---

## 杂项

- **WSL2 切换 root 用户** (`20260128`)
  - 使用 sudo -i 而非 su，避免普通用户无法切换的问题

- **文件阅读命令** (`20260131`)
  - head/tail -n N 查看前后 N 行，tail -f 实时监控
  - less 交互式阅读，less +F 实时追踪模式

- **僵尸进程处理** (`20260131`)
  - ps aux | grep 'Z' 查找僵尸进程
  - kill -9 <父进程PID> 杀掉父进程清理僵尸
