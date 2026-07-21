import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface StudioCanvasKpiCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  isLoading?: boolean;
}

export default function StudioCanvasKpiCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading = false,
}: StudioCanvasKpiCardProps) {
  return (
    <Card className="transition-transform duration-200 hover:-translate-y-1 hover:border-zinc-700">
      <CardContent className="flex items-center justify-between px-5 py-5">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          {isLoading ? (
            <div className="mt-3 h-10 w-20 animate-pulse bg-zinc-800" />
          ) : (
            <p className="font-display mt-2 text-[2.2rem] leading-none text-white">
              {value}
            </p>
          )}
          <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            {description}
          </p>
        </div>

        <div className="accent-bg-soft accent-text accent-border-soft border p-3">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
