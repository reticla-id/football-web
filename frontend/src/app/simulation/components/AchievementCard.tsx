"use client";

import { Trophy } from "lucide-react";

interface AchievementCardProps {
  title: string;
}

export default function AchievementCard({ title }: AchievementCardProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="flex items-center gap-3">
        <div className="accent-bg-soft accent-border-soft flex h-11 w-11 items-center justify-center border">
          <Trophy className="accent-text h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-xs text-zinc-500">Achievement locked</p>
        </div>
      </div>
    </div>
  );
}
