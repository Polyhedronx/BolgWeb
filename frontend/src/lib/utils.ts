/**
 * Format a date string (YYYY-MM-DD) into a human-readable format.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Truncate text to a given length.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/**
 * Build a Gravatar URL from an email address.
 */
export function gravatarUrl(email: string, size = 80): string {
  // Simple hash placeholder — for real Gravatar, you'd MD5 the trimmed lowercase email
  const hash = btoa(email.trim().toLowerCase()).slice(0, 32);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;
}

/** 根据分类生成详情页 URL */
export function postUrl(post: {
  category: string;
  slug: string;
  date: string;
}): string {
  switch (post.category) {
    case "技术":
      return `/tech/${post.slug}`;
    case "随笔":
      return `/essay/${post.slug}`;
    case "日常": {
      const [year, month] = post.date.split("-");
      return `/daily/${year}/${month}/${post.slug}`;
    }
    default:
      return `/tech/${post.slug}`; // fallback
  }
}
