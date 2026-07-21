"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, PanelsLeftBottom, SlidersHorizontal } from "lucide-react";

import {
  clearTempSession,
  deleteCanvasDraft,
  exportCanvasImage,
  getCanvasEditorRecord,
  getCanvasRecordImageUrls,
  getFootballEditorData,
  getGraphicsAssetsByCategory,
  updateCanvasDraft,
  uploadConsoleAsset,
  uploadTempCanvasFile,
} from "./canvas-editor-storage";
import type {
  CanvasAssetCategory,
  CanvasEditorRecord,
  CanvasLibraryAsset,
  FootballDataBundle,
} from "./types";
import { useFabricEditor } from "./useFabricEditor";
import CanvasToolbar from "./components/CanvasToolbar";
import CanvasLeftSidebar from "./components/CanvasLeftSidebar";
import CanvasRightSidebar from "./components/CanvasRightSidebar";
import CanvasCenterStage from "./components/CanvasCenterStage";
import StudioBackButton from "@/app/studio/canvas/components/StudioBackButton";

const BLANK_CANVAS_WIDTH = 1080;
const BLANK_CANVAS_HEIGHT = 1350;

function logCanvasClient(stage: string, payload?: Record<string, unknown>) {
  console.log("[CanvasEditorClient]", stage, payload ?? {});
}

function revokeObjectUrl(url: string | null) {
  if (!url?.startsWith("blob:")) {
    return;
  }

  URL.revokeObjectURL(url);
}

function getLocalImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.width, height: image.height });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read local image dimensions."));
    };

    image.src = objectUrl;
  });
}

type CanvasEditorClientProps = {
  id: string;
};

export default function CanvasEditorClient({ id }: CanvasEditorClientProps) {
  const router = useRouter();
  const [record, setRecord] = useState<CanvasEditorRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CanvasAssetCategory>("upload");
  const [titleDraft, setTitleDraft] = useState("");
  const [titleSaveState, setTitleSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [assets, setAssets] = useState<Record<string, CanvasLibraryAsset[]>>({
    templates: [],
    backgrounds: [],
    frames: [],
    logos: [],
    icons: [],
  });
  const [footballData, setFootballData] = useState<FootballDataBundle | null>(null);
  const [canvasSize, setCanvasSize] = useState({
    width: BLANK_CANVAS_WIDTH,
    height: BLANK_CANVAS_HEIGHT,
  });
  const [canvasImageUrls, setCanvasImageUrls] = useState<{
    tempImageUrl: string | null;
    exportImageUrl: string | null;
  }>({
    tempImageUrl: null,
    exportImageUrl: null,
  });

  useEffect(() => {
    logCanvasClient("editor:mount", { id });
    return () => {
      logCanvasClient("editor:unmount", { id });
    };
  }, [id]);

  useEffect(() => {
    return () => {
      revokeObjectUrl(canvasImageUrls.tempImageUrl);
      revokeObjectUrl(canvasImageUrls.exportImageUrl);
    };
  }, [canvasImageUrls.exportImageUrl, canvasImageUrls.tempImageUrl]);

  useEffect(() => {
    const loadEditor = async () => {
      setIsLoading(true);
      logCanvasClient("editor-load:start", { id });

      const [recordResult, footballResult, ...assetResults] = await Promise.all([
        getCanvasEditorRecord(id),
        getFootballEditorData(),
        getGraphicsAssetsByCategory("templates"),
        getGraphicsAssetsByCategory("backgrounds"),
        getGraphicsAssetsByCategory("frames"),
        getGraphicsAssetsByCategory("logos"),
        getGraphicsAssetsByCategory("icons"),
      ]);

      if (recordResult.error || !recordResult.data) {
        logCanvasClient("editor-load:error", {
          id,
          error: recordResult.error,
        });
        setError(recordResult.error ?? "Unable to load canvas.");
        setIsLoading(false);
        return;
      }

      logCanvasClient("editor-load:record", {
        id,
        tempStoragePath: recordResult.data.temp_storage_path,
        exportStoragePath: recordResult.data.export_storage_path,
        canvasWidth: recordResult.data.canvas_width,
        canvasHeight: recordResult.data.canvas_height,
      });

      const imageUrlsResult = await getCanvasRecordImageUrls(recordResult.data);
      logCanvasClient("editor-load:image-urls", {
        id,
        tempImageUrl: imageUrlsResult.data?.tempImageUrl ?? null,
        exportImageUrl: imageUrlsResult.data?.exportImageUrl ?? null,
      });

      setRecord(recordResult.data);
      setTitleDraft(recordResult.data.title ?? "Untitled Canvas");
      setCanvasSize({
        width: recordResult.data.canvas_width ?? BLANK_CANVAS_WIDTH,
        height: recordResult.data.canvas_height ?? BLANK_CANVAS_HEIGHT,
      });
      setCanvasImageUrls((current) => {
        revokeObjectUrl(current.tempImageUrl);
        revokeObjectUrl(current.exportImageUrl);
        return imageUrlsResult.data ?? { tempImageUrl: null, exportImageUrl: null };
      });
      setFootballData(footballResult.data);
      setAssets({
        templates: assetResults[0].data ?? [],
        backgrounds: assetResults[1].data ?? [],
        frames: assetResults[2].data ?? [],
        logos: assetResults[3].data ?? [],
        icons: assetResults[4].data ?? [],
      });
      setError(recordResult.error ?? footballResult.error);
      logCanvasClient("editor-load:complete", {
        id,
        hasFootballData: Boolean(footballResult.data),
        hasTempImageUrl: Boolean(imageUrlsResult.data?.tempImageUrl),
        hasExportImageUrl: Boolean(imageUrlsResult.data?.exportImageUrl),
      });
      setIsLoading(false);
    };

    void loadEditor();
  }, [id]);

  const handleAutosave = async (json: string) => {
    if (!record) {
      return;
    }

    await updateCanvasDraft(record.id, {
      canvas_json: json,
      canvas_width: canvasSize.width,
      canvas_height: canvasSize.height,
      temp_storage_path: record.temp_storage_path,
    });
  };

  const editor = useFabricEditor({
    width: canvasSize.width,
    height: canvasSize.height,
    initialJson: record?.canvas_json ?? null,
    initialBaseLayerUrl: canvasImageUrls.tempImageUrl ?? canvasImageUrls.exportImageUrl,
    onDirtyChange: handleAutosave,
  });

  useEffect(() => {
    logCanvasClient("editor:image-state", {
      id,
      tempImageUrl: canvasImageUrls.tempImageUrl,
      exportImageUrl: canvasImageUrls.exportImageUrl,
      tempStoragePath: record?.temp_storage_path ?? null,
      exportStoragePath: record?.export_storage_path ?? null,
      initialBaseLayerUrl: canvasImageUrls.tempImageUrl ?? canvasImageUrls.exportImageUrl ?? null,
    });
  }, [
    canvasImageUrls.exportImageUrl,
    canvasImageUrls.tempImageUrl,
    id,
    record?.export_storage_path,
    record?.temp_storage_path,
  ]);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setStatusMessage(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  useEffect(() => {
    if (!record) {
      return;
    }

    const normalizedTitle = titleDraft.trim() || "Untitled Canvas";
    const currentTitle = record.title?.trim() || "Untitled Canvas";

    if (normalizedTitle === currentTitle) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      const result = await updateCanvasDraft(record.id, {
        title: normalizedTitle,
      });

      if (result.data) {
        setRecord(result.data);
        setTitleSaveState("saved");
        window.setTimeout(() => setTitleSaveState("idle"), 1400);
      } else if (result.error) {
        setError(result.error);
        setTitleSaveState("idle");
      }
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [record, titleDraft]);

  const handleUploadImage = async (file: File) => {
    if (!record) {
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Uploads are limited to 20 MB.");
      return;
    }

    setIsBusy(true);
    setError(null);
    let localDimensions: { width: number; height: number };

    try {
      localDimensions = await getLocalImageDimensions(file);
    } catch (dimensionError) {
      const message =
        dimensionError instanceof Error
          ? dimensionError.message
          : "Unable to prepare the local working image.";
      setError(message);
      setIsBusy(false);
      return;
    }

    const localObjectUrl = URL.createObjectURL(file);
    logCanvasClient("upload-image:local-object-url-created", {
      recordId: record.id,
      localObjectUrl,
      width: localDimensions.width,
      height: localDimensions.height,
      fileName: file.name,
    });

    setCanvasSize({
      width: localDimensions.width,
      height: localDimensions.height,
    });
    setCanvasImageUrls((current) => {
      revokeObjectUrl(current.tempImageUrl);
      revokeObjectUrl(current.exportImageUrl);
      return {
        tempImageUrl: localObjectUrl,
        exportImageUrl: null,
      };
    });
    setRecord((current) =>
      current
        ? {
            ...current,
            canvas_width: localDimensions.width,
            canvas_height: localDimensions.height,
          }
        : current
    );

    setStatusMessage("Working image loaded. Syncing to session storage...");
    setIsBusy(false);

    void (async () => {
      const result = await uploadTempCanvasFile(record.id, file);
      if (result.error || !result.data) {
        logCanvasClient("upload-image:background-sync:error", {
          recordId: record.id,
          error: result.error,
        });
        setError(
          result.error ??
            "The image is loaded locally, but session storage sync failed. Keep this tab open while editing."
        );
        return;
      }

      const uploadData = result.data;
      logCanvasClient("upload-image:background-sync:complete", {
        recordId: record.id,
        path: uploadData.path,
        width: uploadData.width,
        height: uploadData.height,
      });

      const updateResult = await updateCanvasDraft(record.id, {
        temp_storage_path: uploadData.path,
        canvas_width: localDimensions.width,
        canvas_height: localDimensions.height,
      });
      logCanvasClient("upload-image:background-sync:database", {
        recordId: record.id,
        savedTempStoragePath: updateResult.data?.temp_storage_path ?? null,
        error: updateResult.error,
      });

      if (updateResult.error) {
        setError(
          "The image is loaded locally, but we couldn't save the session path for reopening."
        );
        return;
      }

      setRecord((current) =>
        current
          ? {
              ...current,
              temp_storage_path: uploadData.path,
              canvas_width: localDimensions.width,
              canvas_height: localDimensions.height,
            }
          : current
      );
      setStatusMessage("Working image synced to session storage.");
    })();
  };

  const handleUploadAsset = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      setError("Uploads are limited to 20 MB.");
      return;
    }

    setIsBusy(true);
    setError(null);
    const result = await uploadConsoleAsset(file);
    if (result.error) {
      setError(result.error);
      setIsBusy(false);
      return;
    }
    setStatusMessage("Asset uploaded to your library.");
    setIsBusy(false);
  };

  const handleExport = async () => {
    if (!record) {
      return;
    }

    setIsBusy(true);
    setError(null);

    const blob = await editor.exportBlob();
    if (!blob) {
      setError("Unable to render export image.");
      setIsBusy(false);
      return;
    }

    const exportResult = await exportCanvasImage(record.id, blob);
    if (exportResult.error || !exportResult.data) {
      setError(exportResult.error ?? "Unable to export image.");
      setIsBusy(false);
      return;
    }
    const exportedData = exportResult.data;

    await updateCanvasDraft(record.id, {
      status: "exported",
      export_storage_path: exportedData.exportPath,
      thumbnail_path: exportedData.thumbnailPath,
      exported_at: new Date().toISOString(),
    });
    await clearTempSession(record.id);

    setRecord((current) =>
      current
        ? {
            ...current,
            status: "exported",
            export_storage_path: exportedData.exportPath,
            thumbnail_path: exportedData.thumbnailPath,
            exported_at: new Date().toISOString(),
          }
        : current
    );
    setStatusMessage("Graphic exported successfully.");
    setIsBusy(false);
  };

  const handleCancel = async () => {
    if (!record) {
      router.push("/studio/canvas");
      return;
    }

    setIsBusy(true);
    await clearTempSession(record.id);
    if (!record.export_storage_path && record.status !== "exported") {
      await deleteCanvasDraft(record.id);
    }
    router.push("/studio/canvas");
  };

  const handleClear = async () => {
    editor.clearEdits();
    if (record) {
      await updateCanvasDraft(record.id, {
        canvas_json: null,
      });
    }
    setStatusMessage("Canvas reset. Temporary working image preserved.");
  };

  const resolvedAssets = useMemo(
    () => ({
      templates: assets.templates,
      backgrounds: assets.backgrounds,
      frames: assets.frames,
      logos: assets.logos,
      icons: assets.icons,
    }),
    [assets]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent p-6">
        <div className="mx-auto max-w-[1800px] space-y-4">
          <div className="h-20 animate-pulse border border-zinc-800 bg-zinc-900/50" />
          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <div className="h-[420px] animate-pulse border border-zinc-800 bg-zinc-900/50 lg:h-[720px]" />
            <div className="h-[720px] animate-pulse border border-zinc-800 bg-zinc-900/50" />
            <div className="h-[420px] animate-pulse border border-zinc-800 bg-zinc-900/50 2xl:h-[720px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="min-h-screen bg-transparent p-6">
        <div className="mx-auto max-w-[980px] border border-rose-500/20 bg-rose-500/10 px-6 py-5 text-rose-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-6">
      <div className="mx-auto max-w-[1800px] space-y-4">
        <StudioBackButton href="/studio/canvas" label="Back to Canvas" />

        <div className="border border-zinc-800 bg-[linear-gradient(180deg,rgba(18,18,18,0.97),rgba(8,8,8,0.98))]">
          <div className="border-b border-zinc-800 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="accent-text text-[11px] font-semibold uppercase tracking-[0.28em]">
                  Canvas Editor
                </p>
                <input
                  value={titleDraft}
                  className="font-display mt-2 w-full bg-transparent text-[1.65rem] leading-[0.92] text-white outline-none placeholder:text-zinc-500 sm:text-[2rem] lg:text-[2.25rem]"
                  placeholder="Untitled Canvas"
                  aria-label="Canvas title"
                  onFocus={() => {
                    const normalizedTitle = titleDraft.trim() || "Untitled Canvas";
                    const currentTitle = record?.title?.trim() || "Untitled Canvas";
                    if (normalizedTitle !== currentTitle) {
                      setTitleSaveState("saving");
                    }
                  }}
                  onBlur={() => {
                    const normalizedTitle = titleDraft.trim() || "Untitled Canvas";
                    const currentTitle = record?.title?.trim() || "Untitled Canvas";
                    if (normalizedTitle !== currentTitle) {
                      setTitleSaveState("saving");
                    }
                  }}
                  onChange={(event) => {
                    const nextTitle = event.target.value;
                    setTitleDraft(nextTitle);

                    const normalizedTitle = nextTitle.trim() || "Untitled Canvas";
                    const currentTitle = record?.title?.trim() || "Untitled Canvas";
                    if (normalizedTitle !== currentTitle) {
                      setTitleSaveState("saving");
                    } else {
                      setTitleSaveState("idle");
                    }
                  }}
                />
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                  {titleSaveState === "saving" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving title...</span>
                    </>
                  ) : titleSaveState === "saved" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 accent-text" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>Inline title syncs automatically with this canvas session.</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setLeftPanelOpen((current) => !current)}
                  className="border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <PanelsLeftBottom className="h-4 w-4" />
                    Tools
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelOpen((current) => !current)}
                  className="border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Properties
                  </span>
                </button>
              </div>
            </div>
            {/* <p className="mt-3 max-w-4xl text-sm leading-6 text-zinc-400 sm:leading-7">
              Create football graphics, manage layers, and autosave every adjustment
              into the active canvas draft.
            </p> */}
          </div>

          <CanvasToolbar
            isBusy={isBusy}
            onExport={() => void handleExport()}
            onClear={() => void handleClear()}
            onCancel={() => void handleCancel()}
          />

          {error ? (
            <div className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          ) : null}

          {statusMessage ? (
            <div className="border-b border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
              {statusMessage}
            </div>
          ) : null}

          <div className="grid min-h-[calc(100vh-16rem)] min-w-0 gap-0 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[256px_minmax(0,1fr)] 2xl:grid-cols-[256px_minmax(0,1fr)_296px]">
            <div className={`${leftPanelOpen ? "block" : "hidden"} lg:block`}>
              <CanvasLeftSidebar
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                assets={resolvedAssets}
                footballData={footballData}
                onUploadImage={(file) => void handleUploadImage(file)}
                onUploadAsset={(file) => void handleUploadAsset(file)}
                onAddText={() => editor.addText()}
                onAddImageAsset={(url, asBaseLayer) =>
                  void editor.addImageFromUrl(url, { asBaseLayer })
                }
                onAddFootballWidget={(title, value, subtitle) =>
                  editor.addFootballStatCard(title, value, subtitle)
                }
                isBusy={isBusy}
              />
            </div>

            <CanvasCenterStage
              canvasElementRef={editor.canvasElementRef}
              stageContainerRef={editor.stageContainerRef}
              canvasClassName={editor.canvasClassName}
              zoom={editor.zoom}
              panMode={editor.panMode}
              setPanMode={editor.setPanMode}
              zoomIn={editor.zoomIn}
              zoomOut={editor.zoomOut}
              resetViewport={editor.resetViewport}
              width={canvasSize.width}
              height={canvasSize.height}
            />

            <div className={`${rightPanelOpen ? "block" : "hidden"} 2xl:block`}>
              <CanvasRightSidebar editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
