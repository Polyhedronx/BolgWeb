import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 - Blog</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="text-center py-16">
      <p className="text-6xl font-bold text-[var(--color-border)] mb-4">404</p>
      <h1 className="text-2xl font-bold mb-4">页面未找到</h1>
      <p className="text-[var(--color-muted)] mb-8">
        你访问的页面不存在或已被移动。
      </p>
      <Link
        to="/"
        className="inline-flex px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity no-underline"
      >
        返回首页
      </Link>
    </div>
    </>
  );
}
