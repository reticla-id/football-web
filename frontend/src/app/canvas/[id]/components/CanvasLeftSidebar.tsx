"use client";

import { useMemo, useRef } from "react";
import {
  ChevronRight,
  FileImage,
  Frame,
  ImagePlus,
  LayoutTemplate,
  Palette,
  Shield,
  Sparkles,
  Type,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  CanvasAssetCategory,
  CanvasLibraryAsset,
  FootballDataBundle,
} from "../types";

interface CanvasLeftSidebarProps {
  activeCategory: CanvasAssetCategory;
  onCategoryChange: (category: CanvasAssetCategory) => void;
  assets: Record<string, CanvasLibraryAsset[]>;
  footballData: FootballDataBundle | null;
  onUploadImage: (file: File) => void;
  onUploadAsset: (file: File) => void;
  onAddText: () => void;
  onAddImageAsset: (url: string, asBaseLayer?: boolean) => void;
  onAddFootballWidget: (title: string, value: string, subtitle: string) => void;
  isBusy?: boolean;
}

const categories = [
  { key: "upload", label: "Upload", icon: Upload },
  { key: "templates", label: "Templates", icon: LayoutTemplate },
  { key: "backgrounds", label: "Backgrounds", icon: Palette },
  { key: "frames", label: "Frames", icon: Frame },
  { key: "logos", label: "Logos", icon: Shield },
  { key: "icons", label: "Icons", icon: Sparkles },
  { key: "text", label: "Text", icon: Type },
  { key: "football-data", label: "Football Data", icon: FileImage },
] as const;

export default function CanvasLeftSidebar({
  activeCategory,
  onCategoryChange,
  assets,
  footballData,
  onUploadImage,
  onUploadAsset,
  onAddText,
  onAddImageAsset,
  onAddFootballWidget,
  isBusy = false,
}: CanvasLeftSidebarProps) {
  const uploadImageInputRef = useRef<HTMLInputElement | null>(null);
  const uploadAssetInputRef = useRef<HTMLInputElement | null>(null);

  const visibleAssets = useMemo(
    () => assets[activeCategory] ?? [],
    [activeCategory, assets]
  );

  return (
    <aside className="flex min-h-0 flex-col border-b border-zinc-800 bg-zinc-950/70 lg:border-r lg:border-b-0">
      <div className="grid grid-cols-2 gap-2 border-b border-zinc-800 p-3 sm:grid-cols-3 lg:grid-cols-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.key;

          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onCategoryChange(category.key)}
              className={[
                "flex min-h-11 items-center gap-2 border px-3 py-2 text-left text-[10px] font-medium uppercase tracking-[0.14em] transition-colors",
                isActive
                  ? "accent-border-soft accent-bg-soft accent-text"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/70 hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{category.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {activeCategory === "upload" ? (
          <div className="space-y-3">
            <Card className="border-zinc-800/80 bg-zinc-950/55">
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Session Upload
                  </p>
                  <p className="text-xs leading-6 text-zinc-500">
                    Working images are uploaded into your active temporary session and
                    kept synced with the current canvas draft.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => uploadImageInputRef.current?.click()}
                  disabled={isBusy}
                >
                  <span className="flex items-center">
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Upload Working Image
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => uploadAssetInputRef.current?.click()}
                  disabled={isBusy}
                >
                  <span className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Library Asset
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            <input
              ref={uploadImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onUploadImage(file);
                }
                event.currentTarget.value = "";
              }}
            />
            <input
              ref={uploadAssetInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onUploadAsset(file);
                }
                event.currentTarget.value = "";
              }}
            />
          </div>
        ) : null}

        {activeCategory === "text" ? (
          <div className="space-y-3">
            <Card className="border-zinc-800/80 bg-zinc-950/55">
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Text Tools
                  </p>
                  <p className="text-xs leading-6 text-zinc-500">
                    Add editable text blocks, then refine size, weight, spacing, and
                    alignment from the properties panel.
                  </p>
                </div>
                <Button className="w-full justify-between" onClick={onAddText}>
                  <span className="flex items-center">
                    <Type className="mr-2 h-4 w-4" />
                    Add Text
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeCategory === "football-data" ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Football Widgets
              </p>
              <p className="text-xs leading-6 text-zinc-500">
                Insert reusable football objects already formatted across the
                application.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() =>
                onAddFootballWidget(
                  "League Goals",
                  String(footballData?.dashboard?.leagueStats?.[0]?.totalGoals ?? 0),
                  footballData?.dashboard?.leagueStats?.[0]?.league ?? "Current competition"
                )
              }
            >
              <span className="flex items-center">
                <FileImage className="mr-2 h-4 w-4" />
                Insert League KPI
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() =>
                onAddFootballWidget(
                  "Top Scorer",
                  footballData?.dashboard?.topScorers?.[0]?.player ?? "No player",
                  footballData?.dashboard?.topScorers?.[0]?.team ?? "No team"
                )
              }
            >
              <span className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                Insert Top Scorer Card
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() =>
                onAddFootballWidget(
                  "Scout Focus",
                  footballData?.players?.[0]?.display_name ?? "No player",
                  footballData?.players?.[0]?.team_name ?? "Player summary"
                )
              }
            >
              <span className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Insert Player Card
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        {!["upload", "text", "football-data"].includes(activeCategory) ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Asset Library
              </p>
              <p className="text-xs leading-6 text-zinc-500">
                Choose an asset to place it on the canvas. Backgrounds are inserted as
                base layers automatically.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {visibleAssets.map((asset) => (
                <button
                  key={asset.path}
                  type="button"
                  onClick={() => onAddImageAsset(asset.url, activeCategory === "backgrounds")}
                  className="border border-zinc-800 bg-zinc-950/70 p-3 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-900/70"
                >
                  <div className="aspect-[4/3] overflow-hidden border border-zinc-800 bg-black/30">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-3 truncate text-sm font-medium text-white">{asset.name}</p>
                </button>
              ))}
              {!visibleAssets.length ? (
                <div className="border border-dashed border-zinc-800 bg-zinc-950/55 px-4 py-10 text-center text-sm text-zinc-500">
                  No assets available in this category yet.
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
