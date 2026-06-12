import { useState } from "react";
import { MessageCircle, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { voteComment } from "@/lib/api";
import Avatar from "@/components/ui/Avatar";
import CommentForm from "./CommentForm";
import type { Comment } from "@/types";

interface CommentItemProps {
  comment: Comment;
  postSlug: string;
  replyingTo: number | null;
  onReplyClick: (id: number) => void;
  onReplyCancel: () => void;
  onReply: (data: { post_slug: string; content: string; parent_id?: number | null }) => Promise<void>;
  onDelete: (id: number) => void;
  isSubmitting: boolean;
  user: { id?: number; username: string; email?: string; role?: string } | null;
  userVotes: Record<number, string>;
}

export default function CommentItem({
  comment,
  postSlug,
  replyingTo,
  onReplyClick,
  onReplyCancel,
  onReply,
  onDelete,
  isSubmitting,
  user,
  userVotes,
}: CommentItemProps) {
  const [counts, setCounts] = useState({ up: comment.upvote_count, down: comment.downvote_count });
  const [myVote, setMyVote] = useState(userVotes[comment.id] || "");
  const [animating, setAnimating] = useState<"up" | "down" | "">("");

  const showReplyForm = replyingTo === comment.id;
  const isAdmin = user?.role === "admin";
  const isOwn = user != null && user.id === comment.author_id;
  const canDelete = isAdmin || isOwn;
  const replyCount = (comment.children || []).length;

  const handleVote = async (type: "up" | "down") => {
    if (!user) return;
    setAnimating(type);
    const prevVote = myVote;
    try {
      const res = await voteComment(comment.id, type);
      setCounts({ up: res.comment.upvote_count, down: res.comment.downvote_count });
      setMyVote(prevVote === type ? "" : type);
    } catch { /* ignore */ }
    setTimeout(() => setAnimating(""), 260);
  };

  const submitReply = async (data: { post_slug: string; content: string; parent_id?: number | null }) => {
    await onReply(data);
    onReplyCancel();
  };

  return (
    <div className="group">
      <div className="flex gap-3">
        <Avatar name={comment.author_name} email={comment.author_email} size={32} className="mt-0.5 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-[var(--color-primary)]">{comment.author_name}</span>
            <span className="text-xs text-[var(--color-faint)]">
              {formatDate(comment.created_at?.split("T")[0] || "")}
            </span>
          </div>

          <p className="comment-body text-sm text-[var(--color-primary)] mb-1.5 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          <div className="comment-actions">
            <button
              onClick={() => handleVote("up")}
              className={`comment-action-btn ${myVote === "up" ? "is-active-like" : ""} ${animating === "up" ? "vote-just-animated" : ""}`}
            >
              <ThumbsUp className="h-4 w-4" />
              {counts.up > 0 && <span>{counts.up}</span>}
            </button>

            <button
              onClick={() => handleVote("down")}
              className={`comment-action-btn ${myVote === "down" ? "is-active-dislike" : ""} ${animating === "down" ? "vote-just-animated" : ""}`}
            >
              <ThumbsDown className="h-4 w-4" />
              {counts.down > 0 && <span>{counts.down}</span>}
            </button>

            {user && (
              <button onClick={() => onReplyClick(comment.id)} className="comment-action-btn">
                <MessageCircle className="h-4 w-4" />
                {replyCount > 0 && <span>{replyCount}</span>}
                <span>回复</span>
              </button>
            )}

            {canDelete && (
              <button onClick={() => onDelete(comment.id)} className="comment-action-btn hover:!text-[var(--color-danger)] ml-auto">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {showReplyForm && user && (
            <div className="mt-2 pl-2 border-l-2 border-[var(--color-border)]">
              <CommentForm
                postSlug={postSlug}
                parentId={comment.id}
                onCancel={onReplyCancel}
                onSubmit={submitReply}
                isSubmitting={isSubmitting}
                username={user.username}
              />
            </div>
          )}

          {comment.children && comment.children.length > 0 && (
            <div className="mt-2 pl-4 border-l-2 border-[var(--color-border)] space-y-0">
              <div className="comment-list">
                {comment.children.map((child) => (
                  <div key={child.id} className="comment-item">
                    <CommentItem
                      comment={child}
                      postSlug={postSlug}
                      replyingTo={replyingTo}
                      onReplyClick={onReplyClick}
                      onReplyCancel={onReplyCancel}
                      onReply={onReply}
                      onDelete={onDelete}
                      isSubmitting={isSubmitting}
                      user={user}
                      userVotes={userVotes}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
