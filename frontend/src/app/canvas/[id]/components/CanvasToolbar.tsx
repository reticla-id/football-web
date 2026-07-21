"use client";

import { Download, Eraser, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CanvasToolbarProps {
  isBusy?: boolean;
  onExport: () => void;
  onClear: () => void;
  onCancel: () => void;
}

export default function CanvasToolbar({
  isBusy = false,
  onExport,
  onClear,
  onCancel,
}: CanvasToolbarProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-zinc-800 bg-zinc-950/80 px-4 py-2.5 sm:flex-row sm:flex-wrap sm:items-center">
      <Button
        size="sm"
        onClick={onExport}
        disabled={isBusy}
        className="justify-center sm:justify-start"
      >
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onClear}
        disabled={isBusy}
        className="justify-center sm:justify-start"
      >
        <Eraser className="mr-2 h-4 w-4" />
        Clear edits
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onCancel}
        disabled={isBusy}
        className="justify-center sm:justify-start"
      >
        <XCircle className="mr-2 h-4 w-4" />
        Cancel
      </Button>
    </div>
  );
}
