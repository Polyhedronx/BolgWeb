import { useState } from "react";

interface CommentFormProps {
  postSlug: string;
  parentId?: number | null;
  onCancel?: () => void;
  onSubmit: (data: {
    post_slug: string;
    author_name: string;
    author_email: string;
    content: string;
    parent_id?: number | null;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function CommentForm({
  postSlug,
  parentId,
  onCancel,
  onSubmit,
  isSubmitting,
}: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const isReply = !!parentId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !content.trim()) {
      setError("昵称和评论内容不能为空");
      return;
    }

    if (content.trim().length > 5000) {
      setError("评论内容不能超过 5000 字");
      return;
    }

    try {
      await onSubmit({
        post_slug: postSlug,
        author_name: name.trim(),
        author_email: email.trim(),
        content: content.trim(),
        parent_id: parentId,
      });
      setName("");
      setEmail("");
      setContent("");
      if (onCancel) onCancel();
    } catch {
      setError("提交失败，请稍后重试");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!isReply && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="昵称 *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
          />
          <input
            type="email"
            placeholder="邮箱 (可选，用于 Gravatar 头像)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
          />
        </div>
      )}

      {isReply && (
        <input
          type="text"
          placeholder="你的昵称 *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
        />
      )}

      <textarea
        placeholder={isReply ? "写下你的回复..." : "写下你的评论..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={isReply ? 3 : 4}
        maxLength={5000}
        className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 resize-y"
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? "提交中..." : isReply ? "回复" : "发表评论"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}
