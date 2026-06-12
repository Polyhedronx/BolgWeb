import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPosts, searchPosts } from "@/lib/api";
import PostCard from "@/components/post/PostCard";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

/** 固定三大分类 */
const CATEGORIES = [
  { key: "", label: "全部" },
  { key: "技术", label: "技术" },
  { key: "随笔", label: "随笔" },
  { key: "日常", label: "日常" },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const tag = searchParams.get("tag") || "";

  // 搜索模式
  const searchQuery = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchPosts(query),
    enabled: !!query,
  });

  // 文章列表（支持分类 + 标签过滤）
  const postsQuery = useQuery({
    queryKey: ["posts", { page, category, tag }],
    queryFn: () => getPosts({ page, limit: 10, category: category || undefined, tag: tag || undefined }),
    enabled: !query,
  });

  const selectCategory = (cat: string) => {
    const params: Record<string, string> = {};
    if (cat) params.category = cat;
    if (tag) params.tag = tag;
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params: Record<string, string> = { page: String(newPage) };
    if (query) params.q = query;
    if (category) params.category = category;
    if (tag) params.tag = tag;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Search results ---
  if (query) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold">
            搜索结果：<span className="text-[var(--color-accent)]">"{query}"</span>
          </h1>
          <button
            onClick={() => setSearchParams({})}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            清除
          </button>
        </div>

        {searchQuery.isLoading && <LoadingSpinner />}

        {searchQuery.data && searchQuery.data.results.length === 0 && (
          <p className="text-[var(--color-muted)] py-8 text-center">
            没有找到相关文章，试试其他关键词吧。
          </p>
        )}

        {searchQuery.data && (
          <div className="space-y-6">
            {searchQuery.data.results.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Normal homepage ---
  return (
    <div>
      {/* 分类筛选栏 */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => selectCategory(cat.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat.key
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg)] border border-[var(--color-border)]"
            }`}
          >
            {cat.label}
          </button>
        ))}

        {/* 标签下拉 */}
        <TagDropdown
          selectedTag={searchParams.get("tag") || ""}
          onSelect={(tag) => {
            const params: Record<string, string> = {};
            if (category) params.category = category;
            if (tag) params.tag = tag;
            setSearchParams(params);
          }}
        />
      </div>

      {postsQuery.isLoading && <LoadingSpinner />}

      {postsQuery.data && postsQuery.data.posts.length === 0 && (
        <p className="text-[var(--color-muted)] py-8 text-center">
          {category ? `分类「${category}」下暂无文章` : "还没有文章，敬请期待！"}
        </p>
      )}

      {postsQuery.data && (
        <>
          <div className="space-y-6">
            {postsQuery.data.posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={postsQuery.data.total_pages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

/** 标签下拉选择器 */
function TagDropdown({
  selectedTag,
  onSelect,
}: {
  selectedTag: string;
  onSelect: (tag: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 获取标签列表
  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetch("/api/v1/tags");
      if (!res.ok) return { tags: [] };
      return res.json() as Promise<{ tags: { name: string; count: number }[] }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 点击外部关闭
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const tags = tagsData?.tags || [];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
          selectedTag
            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
            : "text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg)] border-[var(--color-border)]"
        }`}
      >
        标签
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && tags.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-40 py-1 max-h-60 overflow-y-auto">
          {selectedTag && (
            <button
              onClick={() => {
                onSelect("");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
            >
              清除筛选
            </button>
          )}
          {tags.map((t) => (
            <button
              key={t.name}
              onClick={() => {
                onSelect(t.name);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-[var(--color-bg)] ${
                selectedTag === t.name
                  ? "text-[var(--color-accent)] font-medium"
                  : "text-[var(--color-primary)]"
              }`}
            >
              <span>{t.name}</span>
              <span className="text-xs text-[var(--color-muted)]">{t.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
