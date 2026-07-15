"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  seasons: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function SquadSeasonFilter({
  seasons,
  value,
  onChange,
}: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full border-zinc-800 bg-zinc-950/80 text-zinc-200 sm:w-[190px]">
        <SelectValue placeholder="Season" />
      </SelectTrigger>

      <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-200">
        {seasons.map((season) => (
          <SelectItem key={season} value={season}>
            {season}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
