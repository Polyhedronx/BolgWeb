import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComments, createComment, deleteComment } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MessageSquare, ArrowUpDown } from "lucide-react";
import type { Comment, CreateCommentRequest } from "@/types";

interface CommentSectionProps {
  postSlug: string;
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<"time" | "votes">("time");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postSlug, sortBy],
    queryFn: () => getComments(postSlug, sortBy),
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateCommentRequest) => createComment(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
    },
  });

  const handleSubmit = async (data: CreateCommentRequest) => {
    await createMutation.mutateAsync(data);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这条评论吗？")) return;
    await deleteMutation.mutateAsync(id);
  };

  const comments = data?.comments || [];
  const userVotes = data?.user_votes || {};
  const commentCount = countAll(comments);

  return (
    <section className="border-t border-[var(--color-border)] pt-8">
      {/* Heading + sort */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[var(--color-muted)]" />
          <h2 className="text-lg font-semibold">
            评论 {commentCount > 0 && <span className="text-[var(--color-muted)] font-normal">({commentCount})</span>}
          </h2>
        </div>

        {comments.length > 0 && (
          <button
            onClick={() => setSortBy(sortBy === "time" ? "votes" : "time")}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
              sortBy === "votes"
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            }`}
          >
            <ArrowUpDown className="h-3 w-3" />
            {sortBy === "time" ? "按时间" : "按赞同"}
          </button>
        )}
      </div>

      {/* Comment form or login prompt */}
      {isAuthenticated && user ? (
        <div className="mb-8 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <CommentForm
            postSlug={postSlug}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
            username={user.username}
          />
        </div>
      ) : (
        <div className="mb-8 p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
          <p className="text-sm text-[var(--color-muted)] mb-3">
            请登录后发表评论
          </p>
          <Link
            to="/login"
            className="text-sm px-4 py-1.5 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 inline-block no-underline"
          >
            去登录
          </Link>
        </div>
      )}

      {/* Error */}
      {createMutation.isError && (
        <p className="text-sm text-red-500 mb-4">评论提交失败，请稍后重试</p>
      )}

      {/* Comment list */}
      {isLoading ? (
        <LoadingSpinner />
      ) : comments.length === 0 ? (
        <p className="text-center text-[var(--color-muted)] py-8">暂无评论</p>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <CommentItem
                comment={comment}
                postSlug={postSlug}
                replyingTo={replyingTo}
                onReplyClick={setReplyingTo}
                onReplyCancel={() => setReplyingTo(null)}
                onReply={handleSubmit}
                onDelete={handleDelete}
                isSubmitting={createMutation.isPending}
                user={user}
                userVotes={userVotes}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function countAll(comments: Comment[]): number {
  let count = 0;
  for (const c of comments) {
    count += 1 + (c.children ? countAll(c.children) : 0);
  }
  return count;
}
