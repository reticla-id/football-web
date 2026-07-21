"use client";

import { Hand, Minus, Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ReturnTypeUseFabricEditor } from "./types-internal";

interface CanvasCenterStageProps {
  canvasElementRef: ReturnTypeUseFabricEditor["canvasElementRef"];
  stageContainerRef: ReturnTypeUseFabricEditor["stageContainerRef"];
  canvasClassName: string;
  zoom: number;
  panMode: boolean;
  setPanMode: ReturnTypeUseFabricEditor["setPanMode"];
  zoomIn: ReturnTypeUseFabricEditor["zoomIn"];
  zoomOut: ReturnTypeUseFabricEditor["zoomOut"];
  resetViewport: ReturnTypeUseFabricEditor["resetViewport"];
  width: number;
  height: number;
}

export default function CanvasCenterStage({
  canvasElementRef,
  stageContainerRef,
  canvasClassName,
  zoom,
  panMode,
  setPanMode,
  zoomIn,
  zoomOut,
  resetViewport,
  width,
  height,
}: CanvasCenterStageProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <div className="flex flex-col gap-3 border-b border-zinc-800 bg-zinc-950/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Canvas</p>
          <p className="mt-1 text-sm text-zinc-300">
            {width} x {height}px
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={panMode ? "default" : "outline"}
            size="sm"
            onClick={() => setPanMode(!panMode)}
          >
            <Hand className="mr-2 h-4 w-4" />
            Pan
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <Minus className="h-4 w-4" />
          </Button>
          <div className="min-w-[56px] text-center text-sm text-zinc-400">
            {Math.round(zoom * 100)}%
          </div>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetViewport}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={stageContainerRef}
        className="flex min-h-[420px] min-w-0 flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent_42%),linear-gradient(180deg,rgba(8,8,8,0.96),rgba(0,0,0,0.98))] p-3 sm:min-h-[520px] sm:p-4 lg:min-h-[640px] lg:p-6"
      >
        <div className="flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden">
          <canvas ref={canvasElementRef} className={canvasClassName} />
        </div>
      </div>
    </div>
  );
}
