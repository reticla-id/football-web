"use client";

import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SimulationCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

export default function SimulationCard({
  title,
  description,
  children,
  className,
  contentClassName,
  headerClassName,
}: SimulationCardProps) {
  return (
    <Card
      className={cn(
        "border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,24,0.96),rgba(10,10,10,0.96))]",
        className
      )}
    >
      {title || description ? (
        <CardHeader className={cn("space-y-2 border-b border-zinc-800/70 pb-5", headerClassName)}>
          {title ? <CardTitle className="text-[1.7rem]">{title}</CardTitle> : null}
          {description ? (
            <CardDescription className="max-w-2xl text-sm text-zinc-400">
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
      ) : null}

      <CardContent className={cn(title || description ? "pt-6" : "p-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
