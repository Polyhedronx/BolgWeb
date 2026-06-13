import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getAbout } from "@/lib/api";
import MarkdownRenderer from "@/components/post/MarkdownRenderer";
import Avatar from "@/components/ui/Avatar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  const navigate = useNavigate();
  const { data: about, isLoading, error } = useQuery({
    queryKey: ["about"],
    queryFn: getAbout,
    staleTime: 30 * 60 * 1000, // 30 min cache
  });

  // Loading
  if (isLoading) return <LoadingSpinner />;

  // Error or empty
  if (error || !about) {
    return (
      <>
        <Helmet>
          <title>关于 - Blog</title>
        </Helmet>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">加载失败</h1>
          <p className="text-[var(--color-muted)] mb-6">关于页面暂时无法加载</p>
          <Link to="/" className="text-[var(--color-accent)] hover:underline">
            返回首页
          </Link>
        </div>
      </>
    );
  }

  const siteUrl = window.location.origin;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: about.name || "Blog",
    ...(about.bio && { description: about.bio }),
    url: `${siteUrl}/about`,
    ...(about.social_links.length > 0 && {
      sameAs: about.social_links.map((l) => l.url),
    }),
    ...(about.skills.length > 0 && { knowsAbout: about.skills }),
  };

  return (
    <>
      <Helmet>
        <title>{about.name ? `${about.name} - 关于 - Blog` : "关于 - Blog"}</title>
        <meta name="description" content={about.bio || "关于 Blog 博客"} />
        <meta property="og:title" content={about.name || "关于 - Blog"} />
        <meta property="og:description" content={about.bio || ""} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${siteUrl}/about`} />
        <meta property="og:site_name" content="Blog" />
        <meta property="og:locale" content="zh_CN" />
        <link rel="canonical" href={`${siteUrl}/about`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <article className="min-w-0">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          返回上一步
        </button>

        {/* Profile Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-8 border-b border-[var(--color-border)]">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {about.avatar ? (
              <img
                src={about.avatar}
                alt={about.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-[var(--color-border)]"
              />
            ) : (
              <Avatar name={about.name || "Blog"} size={96} className="w-24 h-24 text-2xl" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {about.name || "Blog"}
            </h1>
            {about.bio && (
              <p className="text-[var(--color-muted)] mb-4">{about.bio}</p>
            )}

            {/* Social links */}
            {about.social_links.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-4">
                {about.social_links.map((link) => {
                  // Auto-prefix mailto: for email addresses, leave others as-is
                  let href = link.url;
                  if (!/^https?:\/\//i.test(href) && href.includes("@")) {
                    href = `mailto:${href}`;
                  }
                  return (
                    <a
                      key={link.name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--color-accent)] hover:underline"
                    >
                      {link.name}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Skills */}
            {about.skills.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {about.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg)] text-[var(--color-muted)] border border-[var(--color-border)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Markdown content */}
        <div className="mb-12">
          <MarkdownRenderer content={about.content} />
        </div>
      </article>
    </>
  );
}
