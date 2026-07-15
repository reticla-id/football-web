import type { ReactNode } from "react";

export default function StatisticsSection({ children }: { children: ReactNode }) {
  return (
    <section className="overflow-hidden border border-zinc-800/80 bg-zinc-900/70">
      {children}
    </section>
  );
}
