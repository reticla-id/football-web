function LoadingBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse -2xl border border-zinc-800/80 bg-zinc-900/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
        <LoadingBlock className="h-10 w-36 -full" />
        <LoadingBlock className="h-64 -[28px]" />
        <LoadingBlock className="h-16 -2xl" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <LoadingBlock className="h-32" />
          <LoadingBlock className="h-32" />
          <LoadingBlock className="h-32" />
          <LoadingBlock className="h-32" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <LoadingBlock className="h-64" />
          <LoadingBlock className="h-64" />
        </div>
      </div>
    </div>
  );
}
