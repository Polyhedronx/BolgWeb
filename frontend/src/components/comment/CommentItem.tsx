import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import CommentForm from "./CommentForm";
import type { Comment } from "@/types";

interface CommentItemProps {
  comment: Comment;
  postSlug: string;
  onReply: (data: {
    post_slug: string;
    author_name: string;
    author_email: string;
    content: string;
    parent_id?: number | null;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function CommentItem({
  comment,
  postSlug,
  onReply,
  isSubmitting,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className="group">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar
          name={comment.author_name}
          email={comment.author_email}
          size={32}
          className="mt-0.5"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm mb-1">
            <span className="font-medium text-[var(--color-primary)]">
              {comment.author_name}
            </span>
            <span className="text-xs text-[var(--color-muted)]">
              {formatDate(comment.created_at?.split("T")[0] || "")}
            </span>
          </div>

          {/* Content */}
          <p className="text-sm text-[var(--color-primary)] leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>

          {/* Reply button */}
          {!showReplyForm && (
            <button
              onClick={() => setShowReplyForm(true)}
              className="inline-flex items-center gap-1 mt-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              <MessageCircle className="h-3 w-3" />
              回复
            </button>
          )}

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 pl-2 border-l-2 border-[var(--color-border)]">
              <CommentForm
                postSlug={postSlug}
                parentId={comment.id}
                onCancel={() => setShowReplyForm(false)}
                onSubmit={onReply}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Nested children */}
          {comment.children && comment.children.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-[var(--color-border)] space-y-4">
              {comment.children.map((child) => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  postSlug={postSlug}
                  onReply={onReply}
                  isSubmitting={isSubmitting}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
