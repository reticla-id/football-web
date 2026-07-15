export default function TimelineMinute({ label }: { label: string }) {
  return (
    <div className="relative flex justify-center">
      <div className="relative z-10 border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-semibold text-white">
        {label}
      </div>
    </div>
  );
}
