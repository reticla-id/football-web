"use client";

import type { ReactNode } from "react";
import { HexColorPicker } from "react-colorful";

import { Button } from "@/components/ui/button";
import type { ReturnTypeUseFabricEditor } from "./types-internal";

interface CanvasRightSidebarProps {
  editor: ReturnTypeUseFabricEditor;
}

export default function CanvasRightSidebar({ editor }: CanvasRightSidebarProps) {
  const {
    selectedObjectState,
    updateActiveObject,
    duplicateActiveObject,
    deleteActiveObject,
    bringForward,
    sendBackward,
  } = editor;

  const hasSelection = Boolean(selectedObjectState.id);
  const isTextObject =
    selectedObjectState.type === "textbox" || selectedObjectState.type === "text";

  return (
    <aside className="min-h-0 overflow-y-auto border-t border-zinc-800 bg-zinc-950/70 p-4 2xl:border-l 2xl:border-t-0">
      <div className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Selection</p>
          <h2 className="mt-2 text-base font-semibold text-white sm:text-lg">
            {hasSelection ? selectedObjectState.type ?? "Object" : "No object selected"}
          </h2>
        </div>

        {hasSelection ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
              <Button variant="outline" onClick={duplicateActiveObject}>
                Duplicate
              </Button>
              <Button variant="outline" onClick={deleteActiveObject}>
                Delete
              </Button>
              <Button variant="outline" onClick={bringForward}>
                Bring forward
              </Button>
              <Button variant="outline" onClick={sendBackward}>
                Send backward
              </Button>
            </div>

            <PropertyGroup label="Fill">
              <HexColorPicker
                color={selectedObjectState.fill}
                onChange={(value) => updateActiveObject({ fill: value })}
              />
            </PropertyGroup>

            <PropertyGroup label="Opacity">
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={selectedObjectState.opacity}
                onChange={(event) =>
                  updateActiveObject({ opacity: Number(event.target.value) })
                }
                className="w-full accent-[var(--accent)]"
              />
            </PropertyGroup>

            <PropertyGroup label="Rotation">
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={selectedObjectState.angle}
                onChange={(event) =>
                  updateActiveObject({ angle: Number(event.target.value) })
                }
                className="w-full accent-[var(--accent)]"
              />
            </PropertyGroup>

            {isTextObject ? (
              <>
                <PropertyGroup label="Font Size">
                  <input
                    type="range"
                    min={14}
                    max={96}
                    step={1}
                    value={selectedObjectState.fontSize}
                    onChange={(event) =>
                      updateActiveObject({ fontSize: Number(event.target.value) })
                    }
                    className="w-full accent-[var(--accent)]"
                  />
                </PropertyGroup>

                <PropertyGroup label="Weight">
                  <div className="grid grid-cols-2 gap-2">
                    {[400, 600, 700, 800].map((weight) => (
                      <Button
                        key={weight}
                        variant={
                          selectedObjectState.fontWeight === weight ? "default" : "outline"
                        }
                        onClick={() => updateActiveObject({ fontWeight: weight })}
                      >
                        {weight}
                      </Button>
                    ))}
                  </div>
                </PropertyGroup>

                <PropertyGroup label="Alignment">
                  <div className="grid grid-cols-2 gap-2">
                    {(["left", "center", "right", "justify"] as const).map((alignment) => (
                      <Button
                        key={alignment}
                        variant={
                          selectedObjectState.textAlign === alignment ? "default" : "outline"
                        }
                        onClick={() => updateActiveObject({ textAlign: alignment })}
                      >
                        {alignment}
                      </Button>
                    ))}
                  </div>
                </PropertyGroup>

                <PropertyGroup label="Letter Spacing">
                  <input
                    type="range"
                    min={-50}
                    max={300}
                    step={5}
                    value={selectedObjectState.charSpacing}
                    onChange={(event) =>
                      updateActiveObject({ charSpacing: Number(event.target.value) })
                    }
                    className="w-full accent-[var(--accent)]"
                  />
                </PropertyGroup>

                <PropertyGroup label="Line Height">
                  <input
                    type="range"
                    min={0.8}
                    max={2}
                    step={0.05}
                    value={selectedObjectState.lineHeight}
                    onChange={(event) =>
                      updateActiveObject({ lineHeight: Number(event.target.value) })
                    }
                    className="w-full accent-[var(--accent)]"
                  />
                </PropertyGroup>
              </>
            ) : null}
          </>
        ) : (
          <div className="border border-dashed border-zinc-800 bg-zinc-950/55 px-4 py-8 text-sm leading-7 text-zinc-500">
            Select a layer on the canvas to edit color, typography, and layout properties.
          </div>
        )}
      </div>
    </aside>
  );
}

function PropertyGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      {children}
    </div>
  );
}
