"use client";

import type { ReactNode } from "react";

export default function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-t border-zinc-800 pt-4 first:border-t-0 first:pt-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
