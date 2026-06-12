export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-auto py-8 text-center text-sm text-[var(--color-muted)]">
      <p>
        &copy; {new Date().getFullYear()} Bolg · Powered by React + Go + PostgreSQL
      </p>
      <p className="mt-1">
        <a href="/api/v1/rss" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors">
          RSS Feed
        </a>
      </p>
    </footer>
  );
}
