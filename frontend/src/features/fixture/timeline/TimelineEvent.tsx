import type { ReactNode } from "react";

export default function TimelineEvent({
  align,
  icon,
  title,
  subtitle,
}: {
  align: "left" | "right";
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  const isLeft = align === "left";

  return (
    <div
      className={`flex items-center gap-3 ${isLeft ? "justify-end text-right" : "justify-start text-left"}`}
    >
      {isLeft ? (
        <>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 truncate text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {subtitle}
            </p>
          </div>
          {icon}
        </>
      ) : (
        <>
          {icon}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 truncate text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {subtitle}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
