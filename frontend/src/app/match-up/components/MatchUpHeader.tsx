"use client";

export default function MatchUpHeader() {
  return (
    <div className="space-y-3">
      <div>
        <p className="accent-text text-xs font-semibold uppercase tracking-[0.3em]">
          Comparison Lab
        </p>
        <h1 className="mt-3 font-display text-[3rem] leading-[0.92] text-white sm:text-[3.8rem]">
          Match Up
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
          Compare two players using the same scouting object and metric source
          already powering Radar Explorer, with shortlist selection and manual
          search in one dedicated side-by-side workspace.
        </p>
      </div>
    </div>
  );
}
