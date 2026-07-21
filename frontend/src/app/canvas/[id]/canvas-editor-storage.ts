"use client";

import { supabase } from "@/lib/supabase/client";
import { getCurrentUser, getDashboardData, getPlayersSummary } from "@/lib/supabase/queries";
import type {
  CanvasEditorRecord,
  CanvasLibraryAsset,
  FootballDataBundle,
} from "./types";

const GRAPHIC_ASSETS_BUCKET = "graphic-assets";
const GRAPHIC_TEMP_BUCKET = "graphic-temp";
const GRAPHIC_EXPORTS_BUCKET = "graphic-exports";

type Result<T> = {
  data: T | null;
  error: string | null;
};

function logCanvasStorage(stage: string, payload?: Record<string, unknown>) {
  console.log("[CanvasStorage]", stage, payload ?? {});
}

export async function getCanvasEditorRecord(id: string): Promise<Result<CanvasEditorRecord>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("canvas_images")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return {
    data: (data as CanvasEditorRecord | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function getCanvasRecordImageUrls(
  record: CanvasEditorRecord
): Promise<Result<{ tempImageUrl: string | null; exportImageUrl: string | null }>> {
  validateStoragePath("temp_storage_path", record.temp_storage_path);
  validateStoragePath("export_storage_path", record.export_storage_path);

  logCanvasStorage("resolve-record-image-urls:start", {
    recordId: record.id,
    tempBucket: GRAPHIC_TEMP_BUCKET,
    exportBucket: GRAPHIC_EXPORTS_BUCKET,
    tempStoragePath: record.temp_storage_path,
    exportStoragePath: record.export_storage_path,
  });

  const [tempImageUrl, exportImageUrl] = await Promise.all([
    record.temp_storage_path ? createSignedUrl(GRAPHIC_TEMP_BUCKET, record.temp_storage_path) : null,
    record.export_storage_path
      ? createSignedUrl(GRAPHIC_EXPORTS_BUCKET, record.export_storage_path)
      : null,
  ]);

  logCanvasStorage("resolve-record-image-urls:complete", {
    recordId: record.id,
    hasTempImageUrl: Boolean(tempImageUrl),
    hasExportImageUrl: Boolean(exportImageUrl),
  });

  return {
    data: {
      tempImageUrl,
      exportImageUrl,
    },
    error: null,
  };
}

export async function createCanvasDraft(
  id?: string,
  options?: { title?: string; width?: number; height?: number }
): Promise<Result<CanvasEditorRecord>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const userResult = await getCurrentUser();
  if (userResult.error || !userResult.data?.id) {
    return { data: null, error: userResult.error ?? "No active user session." };
  }

  const { data, error } = await supabase
    .from("canvas_images")
    .insert({
      ...(id ? { id } : {}),
      user_id: userResult.data.id,
      title: options?.title ?? "Untitled Canvas",
      status: "draft",
      canvas_width: options?.width ?? 1080,
      canvas_height: options?.height ?? 1350,
      canvas_json: null,
    })
    .select("*")
    .single();

  return {
    data: (data as CanvasEditorRecord | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function updateCanvasDraft(
  id: string,
  payload: Partial<CanvasEditorRecord>
): Promise<Result<CanvasEditorRecord>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("canvas_images")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  return {
    data: (data as CanvasEditorRecord | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function deleteCanvasDraft(id: string): Promise<Result<null>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const { error } = await supabase.from("canvas_images").delete().eq("id", id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function uploadConsoleAsset(file: File): Promise<Result<void>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const userResult = await getCurrentUser();
  if (userResult.error || !userResult.data?.id) {
    return { data: null, error: userResult.error ?? "No active user session." };
  }

  const sanitizedName = sanitizeFileName(file.name);
  const path = `${userResult.data.id}/uploads/${Date.now()}-${sanitizedName}`;
  const { error } = await supabase.storage
    .from("user-graphic-assets")
    .upload(path, file, { upsert: true });

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function uploadTempCanvasFile(
  canvasId: string,
  file: File
): Promise<Result<{ path: string; width: number; height: number; signedUrl: string | null }>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const userResult = await getCurrentUser();
  if (userResult.error || !userResult.data?.id) {
    return { data: null, error: userResult.error ?? "No active user session." };
  }

  const path = `${userResult.data.id}/session-${canvasId}/${Date.now()}-${sanitizeFileName(
    file.name
  )}`;
  logCanvasStorage("upload-temp:start", {
    canvasId,
    bucket: GRAPHIC_TEMP_BUCKET,
    path,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });
  const { error } = await supabase.storage
    .from(GRAPHIC_TEMP_BUCKET)
    .upload(path, file, { upsert: true });

  if (error) {
    logCanvasStorage("upload-temp:error", {
      canvasId,
      bucket: GRAPHIC_TEMP_BUCKET,
      path,
      message: error.message,
    });
    return { data: null, error: formatStorageError(error.message, GRAPHIC_TEMP_BUCKET) };
  }

  const dimensions = await getImageDimensions(file);
  const signedUrl = await createSignedUrl(GRAPHIC_TEMP_BUCKET, path);
  logCanvasStorage("upload-temp:complete", {
    canvasId,
    bucket: GRAPHIC_TEMP_BUCKET,
    path,
    width: dimensions.width,
    height: dimensions.height,
    hasSignedUrl: Boolean(signedUrl),
    signedUrl,
  });

  return {
    data: {
      path,
      width: dimensions.width,
      height: dimensions.height,
      signedUrl,
    },
    error: null,
  };
}

export async function getGraphicsAssetsByCategory(
  category: CanvasLibraryAsset["category"]
): Promise<Result<CanvasLibraryAsset[]>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.storage.from(GRAPHIC_ASSETS_BUCKET).list(category, {
    limit: 100,
    offset: 0,
    sortBy: {
      column: "created_at",
      order: "desc",
    },
  });

  if (error) {
    return { data: null, error: formatStorageError(error.message, GRAPHIC_ASSETS_BUCKET) };
  }

  const assets = (data ?? []).filter((item) => !item.name.endsWith("/"));
  const storageBucket = supabase.storage.from(GRAPHIC_ASSETS_BUCKET);

  return {
    data: assets.map((item) => ({
      name: item.name,
      path: `${category}/${item.name}`,
      url: storageBucket.getPublicUrl(`${category}/${item.name}`).data.publicUrl,
      category,
      createdAt: item.created_at ?? null,
    })),
    error: null,
  };
}

export async function getFootballEditorData(): Promise<Result<FootballDataBundle>> {
  const [dashboardResult, playersResult] = await Promise.all([
    getDashboardData(),
    getPlayersSummary(),
  ]);

  if (dashboardResult.error || playersResult.error) {
    return {
      data: null,
      error: dashboardResult.error ?? playersResult.error,
    };
  }

  return {
    data: {
      dashboard: dashboardResult.data,
      players: playersResult.data ?? [],
    },
    error: null,
  };
}

export async function exportCanvasImage(
  canvasId: string,
  blob: Blob
): Promise<Result<{ exportPath: string; thumbnailPath: string }>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const userResult = await getCurrentUser();
  if (userResult.error || !userResult.data?.id) {
    return { data: null, error: userResult.error ?? "No active user session." };
  }

  const exportPath = `${userResult.data.id}/exports/${canvasId}.png`;
  const thumbnailPath = `${userResult.data.id}/exports/${canvasId}-thumbnail.png`;

  const [exportResult, thumbnailResult] = await Promise.all([
    supabase.storage.from(GRAPHIC_EXPORTS_BUCKET).upload(exportPath, blob, {
      upsert: true,
      contentType: "image/png",
    }),
    supabase.storage.from(GRAPHIC_EXPORTS_BUCKET).upload(thumbnailPath, blob, {
      upsert: true,
      contentType: "image/png",
    }),
  ]);

  if (exportResult.error || thumbnailResult.error) {
    return {
      data: null,
      error: formatStorageError(
        exportResult.error?.message ?? thumbnailResult.error?.message ?? "Export failed.",
        GRAPHIC_EXPORTS_BUCKET
      ),
    };
  }

  return {
    data: {
      exportPath,
      thumbnailPath,
    },
    error: null,
  };
}

export async function clearTempSession(
  canvasId: string
): Promise<Result<null>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const userResult = await getCurrentUser();
  if (userResult.error || !userResult.data?.id) {
    return { data: null, error: userResult.error ?? "No active user session." };
  }

  const prefix = `${userResult.data.id}/session-${canvasId}`;
  const { data, error } = await supabase.storage.from(GRAPHIC_TEMP_BUCKET).list(prefix, {
    limit: 100,
    offset: 0,
  });

  if (error) {
    return { data: null, error: formatStorageError(error.message, GRAPHIC_TEMP_BUCKET) };
  }

  const filePaths = (data ?? []).filter((item) => !item.name.endsWith("/")).map((item) => `${prefix}/${item.name}`);

  if (!filePaths.length) {
    return { data: null, error: null };
  }

  const { error: removeError } = await supabase.storage
    .from(GRAPHIC_TEMP_BUCKET)
    .remove(filePaths);

  return {
    data: null,
    error: removeError?.message
      ? formatStorageError(removeError.message, GRAPHIC_TEMP_BUCKET)
      : null,
  };
}

async function createSignedUrl(bucket: string, path: string) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) {
    logCanvasStorage("create-signed-url:error", {
      bucket,
      path,
      message: error.message,
    });
    return null;
  }

  logCanvasStorage("create-signed-url:success", {
    bucket,
    path,
    signedUrl: data.signedUrl,
  });
  return data.signedUrl;
}

function sanitizeFileName(value: string) {
  return value.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
}

function formatStorageError(message: string, bucket: string) {
  if (/bucket not found/i.test(message)) {
    return `Storage bucket "${bucket}" is unavailable. Verify the bucket name and confirm this environment is connected to the correct Supabase project.`;
  }

  return message;
}

function validateStoragePath(label: string, path: string | null) {
  if (!path) {
    return;
  }

  const looksMalformed =
    path.includes("/storage/v1/object") ||
    path.includes("http://") ||
    path.includes("https://") ||
    path.includes("?token=") ||
    path.startsWith(`${GRAPHIC_TEMP_BUCKET}/`) ||
    path.startsWith(`${GRAPHIC_EXPORTS_BUCKET}/`) ||
    path.startsWith(`${GRAPHIC_ASSETS_BUCKET}/`);

  if (!looksMalformed) {
    return;
  }

  logCanvasStorage("storage-path:unexpected-format", {
    label,
    path,
  });
}

function getImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.width, height: image.height });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image dimensions."));
    };
    image.src = objectUrl;
  });
}
