"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, ImagePlus, Images, Sparkles, Upload } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createCanvasDraft,
  getRecentCanvasSessions,
  getRecentStudioCanvasStorageItems,
  getStudioCanvasBucketCount,
  uploadConsoleAsset,
  type StudioCanvasStorageItem,
} from "../storage";
import StudioCanvasEmptyState from "./StudioCanvasEmptyState";
import StudioBackButton from "./StudioBackButton";
import StudioCanvasKpiCard from "./StudioCanvasKpiCard";
import StudioCanvasStorageList from "./StudioCanvasStorageList";

const EXPORTS_BUCKET = "graphics-exports";
const ASSETS_BUCKET = "user-graphic-assets";

type BucketState = {
  count: number;
  items: StudioCanvasStorageItem[];
  error: string | null;
};

const initialBucketState: BucketState = {
  count: 0,
  items: [],
  error: null,
};

export default function StudioCanvasConsoleClient() {
  const router = useRouter();
  const [exportsState, setExportsState] = useState<BucketState>(initialBucketState);
  const [assetsState, setAssetsState] = useState<BucketState>(initialBucketState);
  const [recentSessions, setRecentSessions] = useState<StudioCanvasStorageItem[]>([]);
  const [recentSessionsError, setRecentSessionsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadStorageSummary = async () => {
    const [
      exportsCountResult,
      recentSessionsResult,
      assetsCountResult,
      assetsItemsResult,
    ] = await Promise.all([
      getStudioCanvasBucketCount(EXPORTS_BUCKET),
      getRecentCanvasSessions(5),
      getStudioCanvasBucketCount(ASSETS_BUCKET),
      getRecentStudioCanvasStorageItems(ASSETS_BUCKET, 5),
    ]);

    setExportsState({
      count: exportsCountResult.data ?? 0,
      items: recentSessionsResult.data ?? [],
      error: exportsCountResult.error,
    });
    setRecentSessions(recentSessionsResult.data ?? []);
    setRecentSessionsError(recentSessionsResult.error);

    setAssetsState({
      count: assetsCountResult.data ?? 0,
      items: assetsItemsResult.data ?? [],
      error: assetsCountResult.error ?? assetsItemsResult.error,
    });
  };

  useEffect(() => {
    const loadStudioCanvasData = async () => {
      setIsLoading(true);
      await reloadStorageSummary();
      setIsLoading(false);
    };

    void loadStudioCanvasData();
  }, []);

  const pageError = useMemo(
    () => error ?? recentSessionsError ?? exportsState.error ?? assetsState.error,
    [assetsState.error, error, exportsState.error, recentSessionsError]
  );

  const handleCreateImage = async () => {
    setIsActionLoading(true);
    setError(null);
    const canvasId = crypto.randomUUID();
    const result = await createCanvasDraft(canvasId);
    if (result.error || !result.data) {
      setError(result.error ?? "Unable to create canvas draft.");
      setIsActionLoading(false);
      return;
    }
    router.push(`/studio/canvas/${canvasId}`);
  };

  const handleOpenRecentImage = (item: StudioCanvasStorageItem) => {
    const canvasId = item.id ?? extractCanvasId(item.path);
    if (!canvasId) {
      return;
    }

    router.push(`/studio/canvas/${canvasId}`);
  };

  const handleUploadAsset = async (file: File) => {
    setIsActionLoading(true);
    setError(null);
    const result = await uploadConsoleAsset(file);
    if (result.error) {
      setError(result.error);
      setIsActionLoading(false);
      return;
    }
    await reloadStorageSummary();
    setIsActionLoading(false);
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 lg:px-6 lg:py-6">
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 xl:space-y-10"
        >
          <StudioBackButton href="/studio" label="Back to Studio" />

          <section className="space-y-6">
            <div className="space-y-3">
              <p className="accent-text text-xs font-semibold uppercase tracking-[0.34em]">
                Studio Lab
              </p>
              <h1 className="font-display text-[3rem] leading-[0.92] text-white sm:text-[3.8rem]">
                Canvas
              </h1>
              <p className="max-w-4xl text-sm leading-7 text-zinc-400 sm:text-base">
                This is the workspace for creating football graphics, managing exports,
                and organizing your visual asset library.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="sm:w-auto" onClick={() => void handleCreateImage()} disabled={isActionLoading}>
                <ImagePlus className="mr-2 h-4 w-4" />
                Create Image
              </Button>
              <UploadAssetButton onUpload={(file) => void handleUploadAsset(file)} disabled={isActionLoading} />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <StudioCanvasKpiCard
              title="Total Images"
              value={exportsState.count}
              description="Objects inside graphics-exports"
              icon={Images}
              isLoading={isLoading}
            />
            <StudioCanvasKpiCard
              title="Total Assets"
              value={assetsState.count}
              description="Objects inside user-graphic-assets"
              icon={FolderOpen}
              isLoading={isLoading}
            />
          </section>

          {pageError ? (
            <div className="border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {pageError}
            </div>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader className="px-5 py-5">
                <CardTitle>Recent Images</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                {isLoading ? (
                  <StudioCanvasStorageList items={[]} isLoading />
                ) : recentSessions.length ? (
                  <StudioCanvasStorageList
                    items={recentSessions}
                    onItemClick={handleOpenRecentImage}
                  />
                ) : (
                  <StudioCanvasEmptyState
                    icon={Sparkles}
                    title="No graphics exported yet"
                    description="Create your first football graphic to start building the studio archive."
                    ctaLabel="Create First Image"
                    onCtaClick={() => void handleCreateImage()}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-5 py-5">
                <CardTitle>My Assets</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                {isLoading ? (
                  <StudioCanvasStorageList items={[]} isLoading />
                ) : assetsState.items.length ? (
                  <StudioCanvasStorageList items={assetsState.items} />
                ) : (
                  <StudioCanvasEmptyState
                    icon={Upload}
                    title="No assets uploaded yet"
                    description="Upload your first badge, texture, or overlay so it is ready for the canvas workspace."
                    ctaLabel="Upload First Asset"
                    onCtaClick={() => document.getElementById("studio-canvas-upload-asset-input")?.click()}
                  />
                )}
              </CardContent>
            </Card>
          </section>
        </motion.main>
      </div>
    </div>
  );
}

function extractCanvasId(path: string) {
  const match = path.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i
  );

  return match?.[1] ?? null;
}

function UploadAssetButton({
  onUpload,
  disabled = false,
}: {
  onUpload: (file: File) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <Button
        variant="outline"
        className="sm:w-auto"
        disabled={disabled}
        onClick={() => document.getElementById("studio-canvas-upload-asset-input")?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload Asset
      </Button>
      <input
        id="studio-canvas-upload-asset-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onUpload(file);
          }
          event.currentTarget.value = "";
        }}
      />
    </>
  );
}
