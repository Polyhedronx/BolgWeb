import { Link, useNavigate } from "react-router-dom";
import { Search, Settings } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onOpenDrawer?: () => void;
}

export default function Header({ onOpenDrawer }: HeaderProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors no-underline"
        >
          Blog
        </Link>

        {/* Search + Settings */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" />
              <input
                type="text"
                placeholder="搜索文章..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-28 xs:w-36 sm:w-48 pl-8 pr-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all"
              />
            </div>
          </form>

          <button
            onClick={onOpenDrawer}
            className="p-2 rounded-md text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg)] transition-colors"
            aria-label="设置"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
