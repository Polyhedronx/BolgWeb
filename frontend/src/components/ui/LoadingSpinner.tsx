export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-accent)]" />
    </div>
  );
}
