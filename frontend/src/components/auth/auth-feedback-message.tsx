"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface AuthFeedbackMessageProps {
  tone: "error" | "success" | "info";
  message: string;
}

export function AuthFeedbackMessage({
  tone,
  message,
}: AuthFeedbackMessageProps) {
  const icon =
    tone === "error" ? (
      <AlertCircle className="h-4 w-4" />
    ) : tone === "success" ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : (
      <Info className="h-4 w-4" />
    );

  const className =
    tone === "error"
      ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
      : tone === "success"
        ? "border-[color:var(--accent)]/25 bg-[color:var(--accent-soft)] text-white"
        : "border-zinc-800 bg-zinc-900/70 text-zinc-300";

  return (
    <div
      className={`flex items-start gap-2 border px-3 py-3 text-sm ${className}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
