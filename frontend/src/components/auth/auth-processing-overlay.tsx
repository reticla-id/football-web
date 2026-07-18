"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AuthProcessingOverlayProps {
  visible: boolean;
  message: string;
}

export function AuthProcessingOverlay({
  visible,
  message,
}: AuthProcessingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
      <div className="flex items-center gap-3 border border-zinc-800/90 bg-black/90 px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.32)]">
        <LoadingSpinner className="h-4 w-4 text-[var(--accent)]" />
        <p className="text-sm text-white">{message}</p>
      </div>
    </div>
  );
}
