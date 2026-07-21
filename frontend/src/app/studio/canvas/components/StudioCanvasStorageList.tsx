import { ImageOff } from "lucide-react";

import type { StudioCanvasStorageItem } from "../storage";

interface StudioCanvasStorageListProps {
  items: StudioCanvasStorageItem[];
  isLoading?: boolean;
  onItemClick?: (item: StudioCanvasStorageItem) => void;
}

export default function StudioCanvasStorageList({
  items,
  isLoading = false,
  onItemClick,
}: StudioCanvasStorageListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[84px_minmax(0,1fr)] gap-4 border border-zinc-800 bg-zinc-950/60 p-3"
          >
            <div className="aspect-[4/3] animate-pulse bg-zinc-800" />
            <div className="space-y-3 py-1">
              <div className="h-4 w-2/3 animate-pulse bg-zinc-800" />
              <div className="h-3 w-1/3 animate-pulse bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <button
          key={item.path}
          type="button"
          className="grid w-full grid-cols-[84px_minmax(0,1fr)] gap-4 border border-zinc-800 bg-zinc-950/60 p-3 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-950/80 disabled:cursor-default disabled:hover:border-zinc-800 disabled:hover:bg-zinc-950/60"
          onClick={() => onItemClick?.(item)}
          disabled={!onItemClick}
        >
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border border-zinc-800 bg-black/30">
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageOff className="h-5 w-5 text-zinc-500" />
            )}
          </div>

          <div className="min-w-0 py-1">
            <p className="truncate text-sm font-medium text-white">{item.name}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
              {formatStudioDate(item.createdAt)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function formatStudioDate(value: string | null) {
  if (!value) {
    return "Unknown date";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}
