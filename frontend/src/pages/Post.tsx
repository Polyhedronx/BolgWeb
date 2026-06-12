import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPost } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import MarkdownRenderer from "@/components/post/MarkdownRenderer";
import CommentSection from "@/components/comment/CommentSection";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Calendar, Folder, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function PostPage() {
  const params = useParams<{ slug?: string; dateSlug?: string }>();
  const slug = params.slug || params.dateSlug!;
  const navigate = useNavigate();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPost(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingSpinner />;

  if (error || !post) {
    const isPremium = error?.message?.includes("高级用户");
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">
          {isPremium ? "高级用户专享" : "文章未找到"}
        </h1>
        <p className="text-[var(--color-muted)] mb-6">
          {isPremium
            ? "该文章仅对高级用户开放，请登录或升级账户后查看。"
            : `找不到 slug 为 "${slug}" 的文章`}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-[var(--color-accent)] hover:underline"
          >
            返回上一步
          </button>
          {isPremium && (
            <Link to="/login" className="text-sm px-4 py-1.5 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90">
              去登录
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - Bolg</title>
        <meta name="description" content={post.description} />
      </Helmet>

      <article>
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          返回上一步
        </button>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)] mb-4">
            {post.category && (
              <span className="flex items-center gap-1">
                <Folder className="h-4 w-4" />
                <Link
                  to={`/?category=${encodeURIComponent(post.category)}`}
                  className="text-[var(--color-muted)] hover:text-[var(--color-accent)] no-underline"
                >
                  {post.category}
                </Link>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.date)}
            </span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/tags/${encodeURIComponent(tag)}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg)] text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors no-underline"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="border-t border-[var(--color-border)] pt-8 mb-12">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>

      {/* Comments */}
      <CommentSection postSlug={post.slug} />
    </>
  );
}
