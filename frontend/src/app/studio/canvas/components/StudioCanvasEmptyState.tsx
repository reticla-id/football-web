import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface StudioCanvasEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}

export default function StudioCanvasEmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
}: StudioCanvasEmptyStateProps) {
  return (
    <div className="border border-dashed border-zinc-800 bg-zinc-950/55 px-6 py-12 text-center">
      <div className="accent-bg-soft accent-border-soft accent-text mx-auto flex h-14 w-14 items-center justify-center border">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-400">
        {description}
      </p>
      {ctaHref ? (
        <Button asChild className="mt-6">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : (
        <Button className="mt-6" onClick={onCtaClick}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
