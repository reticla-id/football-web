"use client";

interface ComparisonCardProps {
  label: string;
}

export default function ComparisonCard({ label }: ComparisonCardProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {label}
      </p>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="border border-zinc-800 bg-black/40 px-3 py-3 text-center text-sm text-zinc-300">
          --
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">vs</span>
        <div className="border border-zinc-800 bg-black/40 px-3 py-3 text-center text-sm text-zinc-300">
          --
        </div>
      </div>
    </div>
  );
}
