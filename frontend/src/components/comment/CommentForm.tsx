import { useState } from "react";

interface CommentFormProps {
  postSlug: string;
  parentId?: number | null;
  onCancel?: () => void;
  onSubmit: (data: { post_slug: string; content: string; parent_id?: number | null }) => Promise<void>;
  isSubmitting: boolean;
  username: string;
}

export default function CommentForm({
  postSlug,
  parentId,
  onCancel,
  onSubmit,
  isSubmitting,
  username,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const isReply = !!parentId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("评论内容不能为空");
      return;
    }
    if (content.trim().length > 5000) {
      setError("评论内容不能超过 5000 字");
      return;
    }

    try {
      await onSubmit({ post_slug: postSlug, content: content.trim(), parent_id: parentId });
      setContent("");
      if (onCancel) onCancel();
    } catch {
      setError("提交失败，请稍后重试");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!isReply && (
        <p className="text-xs text-[var(--color-muted)]">
          以 <span className="font-medium text-[var(--color-primary)]">{username}</span> 的身份发表评论
        </p>
      )}

      <textarea
        placeholder={isReply ? "写下你的回复..." : "写下你的评论..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={isReply ? 3 : 4}
        maxLength={5000}
        className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 resize-y"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

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
            className="px-4 py-2 text-sm rounded-lg bg-[var(--color-muted)] text-white hover:opacity-85 transition-opacity"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}
