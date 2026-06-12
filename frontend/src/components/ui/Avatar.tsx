import { useState, useEffect } from "react";

interface AvatarProps {
  name: string;
  email?: string;
  size?: number;
  className?: string;
}

/**
 * 从名字中提取显示文本：
 * - 中文 → 取前两个汉字
 * - 英文 → 取前两个单词的首字母大写
 * - 单字 → 取前两个字符
 */
function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  // 含中文则取前两字
  if (/[一-鿿]/.test(trimmed)) {
    return trimmed.slice(0, 2);
  }

  // 英文：取单词首字母
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

/** 根据名字生成稳定的 HSL 背景色 */
function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 42%)`;
}

/**
 * 首字母头像组件。
 * 立即渲染文字头像（零网络请求），后台异步尝试 Gravatar，
 * 加载成功后平滑替换。
 */
export default function Avatar({
  name,
  email,
  size = 40,
  className = "",
}: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = nameToColor(name);
  const [gravatarLoaded, setGravatarLoaded] = useState(false);

  const gravatarUrl = email
    ? `https://www.gravatar.com/avatar/${simpleHash(email.trim().toLowerCase())}?s=${size * 2}&d=404`
    : null;

  useEffect(() => {
    if (!gravatarUrl) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setGravatarLoaded(true);
    };
    img.src = gravatarUrl;
    return () => {
      cancelled = true;
    };
  }, [gravatarUrl]);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full flex-shrink-0 select-none overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      title={name}
    >
      {/* 文字头像（始终可见） */}
      <div
        className="absolute inset-0 flex items-center justify-center text-white font-semibold"
        style={{
          backgroundColor: bgColor,
          fontSize: size * 0.38,
          opacity: gravatarLoaded ? 0 : 1,
          transition: "opacity 0.3s",
        }}
      >
        {initials}
      </div>

      {/* Gravatar（加载成功后覆盖） */}
      {gravatarLoaded && (
        <img
          src={gravatarUrl!}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: gravatarLoaded ? 1 : 0, transition: "opacity 0.3s" }}
        />
      )}
    </div>
  );
}

/** 简易 MD5 替代：用 btoa 截断生成 hash（Gravatar 接受任意 hex string） */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  // 转成 32 位 hex
  return Math.abs(hash).toString(16).padStart(32, "0").slice(0, 32);
}
