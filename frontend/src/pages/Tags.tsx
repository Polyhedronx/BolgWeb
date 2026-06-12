import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTags, getCategories } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Helmet } from "react-helmet-async";

export default function TagsPage() {
  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  const catsQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return (
    <>
      <Helmet>
        <title>标签 & 分类 - Bolg</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold mb-8">标签 & 分类</h1>

        {/* Categories */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[var(--color-border)]">
            📂 分类
          </h2>
          {catsQuery.isLoading ? (
            <LoadingSpinner />
          ) : catsQuery.data?.categories && catsQuery.data.categories.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {catsQuery.data.categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/?category=${encodeURIComponent(cat.name)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors no-underline"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-[var(--color-muted)] bg-[var(--color-bg)] px-1.5 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[var(--color-muted)]">暂无分类</p>
          )}
        </section>

        {/* Tags */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[var(--color-border)]">
            🏷️ 标签
          </h2>
          {tagsQuery.isLoading ? (
            <LoadingSpinner />
          ) : tagsQuery.data?.tags && tagsQuery.data.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tagsQuery.data.tags.map((tag) => (
                <Link
                  key={tag.name}
                  to={`/tags/${encodeURIComponent(tag.name)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] text-sm transition-colors no-underline"
                >
                  <span>{tag.name}</span>
                  <span className="text-xs text-[var(--color-muted)]">
                    ({tag.count})
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[var(--color-muted)]">暂无标签</p>
          )}
        </section>
      </div>
    </>
  );
}
