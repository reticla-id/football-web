"use client";

import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <LoaderCircle
      className={cn("h-4 w-4 animate-spin", className)}
      aria-hidden="true"
    />
  );
}
