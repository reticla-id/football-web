"use client";

interface TacticSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function TacticSlider({
  label,
  value,
  onChange,
}: TacticSliderProps) {
  return (
    <div className="space-y-3 border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-sm text-zinc-400">{value}</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ accentColor: "var(--accent)" }}
        className="radar-accent-slider h-2 w-full cursor-pointer appearance-none bg-zinc-800 accent-[var(--accent)]"
      />
    </div>
  );
}
