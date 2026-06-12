import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComments, createComment } from "@/lib/api";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MessageSquare } from "lucide-react";
import type { Comment, CreateCommentRequest } from "@/types";

interface CommentSectionProps {
  postSlug: string;
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postSlug],
    queryFn: () => getComments(postSlug),
  });

  const mutation = useMutation({
    mutationFn: (req: CreateCommentRequest) => createComment(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
    },
  });

  const handleSubmit = async (data: CreateCommentRequest) => {
    await mutation.mutateAsync(data);
  };

  const comments = data?.comments || [];
  const commentCount = countAll(comments);

  return (
    <section className="border-t border-[var(--color-border)] pt-8">
      {/* Heading */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-[var(--color-muted)]" />
        <h2 className="text-lg font-semibold">
          评论 {commentCount > 0 && <span className="text-[var(--color-muted)] font-normal">({commentCount})</span>}
        </h2>
      </div>

      {/* New comment form */}
      <div className="mb-8 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <CommentForm
          postSlug={postSlug}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      </div>

      {/* Error */}
      {mutation.isError && (
        <p className="text-sm text-red-500 mb-4">评论提交失败，请稍后重试</p>
      )}

      {/* Comment list */}
      {isLoading ? (
        <LoadingSpinner />
      ) : comments.length === 0 ? (
        <p className="text-center text-[var(--color-muted)] py-8">
          暂无评论，来留下第一条吧！
        </p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postSlug={postSlug}
              onReply={handleSubmit}
              isSubmitting={mutation.isPending}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** Recursively count all comments including nested replies. */
function countAll(comments: Comment[]): number {
  let count = 0;
  for (const c of comments) {
    count += 1 + (c.children ? countAll(c.children) : 0);
  }
  return count;
}
