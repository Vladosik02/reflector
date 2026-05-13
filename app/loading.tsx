export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-site items-center justify-center px-4">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-brand-line border-t-brand-accent"
        role="status"
        aria-label="Загрузка"
      />
    </div>
  );
}
