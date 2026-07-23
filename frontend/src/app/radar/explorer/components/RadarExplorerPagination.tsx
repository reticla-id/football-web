"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function RadarExplorerPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: Props) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border border-zinc-800 bg-zinc-900/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-400">
        Showing <span className="font-medium text-white">{start}</span>
        {" - "}
        <span className="font-medium text-white">{end}</span>
        {" of "}
        <span className="font-medium text-white">{totalItems}</span>
        {" players"}
      </p>

      <div className="flex items-center justify-end gap-2 self-end sm:self-auto">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="hover-accent-border flex h-10 w-10 items-center justify-center border border-zinc-800 bg-zinc-900 transition-all duration-200 hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium">
          {currentPage}
          <span className="mx-1 text-zinc-500">/</span>
          {totalPages}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="hover-accent-border flex h-10 w-10 items-center justify-center border border-zinc-800 bg-zinc-900 transition-all duration-200 hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
