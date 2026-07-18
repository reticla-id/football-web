"use client";

interface PlayerRatingCardProps {
  label: string;
}

export default function PlayerRatingCard({ label }: PlayerRatingCardProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="mt-1 text-xs text-zinc-500">Player rating placeholder</p>
        </div>
        <div className="border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-zinc-400">
          --
        </div>
      </div>
    </div>
  );
}
