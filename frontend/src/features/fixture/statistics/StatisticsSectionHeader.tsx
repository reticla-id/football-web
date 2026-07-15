export default function StatisticsSectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-zinc-800 px-5 py-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {title}
      </h3>
    </div>
  );
}
