import { Link } from "react-router-dom";
import { Calendar, Folder } from "lucide-react";
import { formatDate, postUrl } from "@/lib/utils";
import type { PostSummary } from "@/types";

interface PostCardProps {
  post: PostSummary;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6 hover:shadow-md transition-shadow">
      {/* Category & Date */}
      <div className="flex items-center gap-3 text-xs text-[var(--color-muted)] mb-3">
        {post.category && (
          <span className="flex items-center gap-1">
            <Folder className="h-3 w-3" />
            {post.category}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(post.date)}
        </span>
      </div>

      {/* Title */}
      <Link
        to={postUrl(post)}
        className="no-underline hover:underline decoration-[var(--color-accent)] underline-offset-4"
      >
        <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-2 leading-snug">
          {post.title}
        </h2>
      </Link>

      {/* Description */}
      {post.description && (
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
          {post.description}
        </p>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/tags/${encodeURIComponent(tag)}`}
              className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors no-underline"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
