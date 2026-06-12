import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/lib/api";
import PostCard from "@/components/post/PostCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Pagination from "@/components/ui/Pagination";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TagPostsPage() {
  const { tag } = useParams<{ tag: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  const { data, isLoading } = useQuery({
    queryKey: ["posts", "tag", tag, page],
    queryFn: () => getPosts({ tag, page, limit: 10 }),
    enabled: !!tag,
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* Back link */}
      <Link
        to="/tags"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors mb-6 no-underline"
      >
        <ArrowLeft className="h-4 w-4" />
        所有标签
      </Link>

      <h1 className="text-2xl font-bold mb-8">
        标签：<span className="text-[var(--color-accent)]">#{tag}</span>
      </h1>

      {isLoading && <LoadingSpinner />}

      {data && data.posts.length === 0 && (
        <p className="text-[var(--color-muted)] py-8 text-center">
          该标签下暂无文章
        </p>
      )}

      {data && (
        <>
          <div className="space-y-6">
            {data.posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={data.total_pages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
