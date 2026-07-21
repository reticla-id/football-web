"use client";

import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/supabase/queries";
import type { CanvasEditorRecord } from "@/app/canvas/[id]/types";

export type StudioCanvasStorageItem = {
  id?: string;
  name: string;
  path: string;
  createdAt: string | null;
  thumbnailUrl: string | null;
};

type StudioCanvasStorageResult<T> = {
  data: T | null;
  error: string | null;
};

const STORAGE_BATCH_SIZE = 100;
const GRAPHIC_TEMP_BUCKET = "graphic-temp";
const GRAPHIC_EXPORTS_BUCKET = "graphic-exports";

export async function createCanvasDraft(
  id?: string,
  options?: { title?: string; width?: number; height?: number }
) {
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

export async function uploadConsoleAsset(file: File) {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const userResult = await getCurrentUser();
  if (userResult.error || !userResult.data?.id) {
    return { data: null, error: userResult.error ?? "No active user session." };
  }

  const path = `${userResult.data.id}/uploads/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage
    .from("user-graphic-assets")
    .upload(path, file, { upsert: true });

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function getStudioCanvasBucketCount(
  bucket: string
): Promise<StudioCanvasStorageResult<number>> {
  if (!supabase) {
    return { data: null, error: "Supabase storage is not configured." };
  }

  let offset = 0;
  let total = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list("", {
      limit: STORAGE_BATCH_SIZE,
      offset,
      sortBy: {
        column: "created_at",
        order: "desc",
      },
    });

    if (error) {
      return {
        data: null,
        error: error.message,
      };
    }

    const files = (data ?? []).filter((item) => !item.name.endsWith("/"));
    total += files.length;

    if ((data ?? []).length < STORAGE_BATCH_SIZE) {
      break;
    }

    offset += STORAGE_BATCH_SIZE;
  }

  return { data: total, error: null };
}

export async function getRecentStudioCanvasStorageItems(
  bucket: string,
  limit = 5
): Promise<StudioCanvasStorageResult<StudioCanvasStorageItem[]>> {
  if (!supabase) {
    return { data: null, error: "Supabase storage is not configured." };
  }

  const { data, error } = await supabase.storage.from(bucket).list("", {
    limit,
    offset: 0,
    sortBy: {
      column: "created_at",
      order: "desc",
    },
  });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  const files = (data ?? []).filter((item) => !item.name.endsWith("/"));
  const normalizedItems = await Promise.all(
    files.map(async (item) => ({
      name: item.name,
      path: item.name,
      createdAt: item.created_at ?? null,
      thumbnailUrl: await getStoragePreviewUrl(bucket, item.name),
    }))
  );

  return {
    data: normalizedItems,
    error: null,
  };
}

export async function getRecentCanvasSessions(
  limit = 5
): Promise<StudioCanvasStorageResult<StudioCanvasStorageItem[]>> {
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const userResult = await getCurrentUser();
  if (userResult.error || !userResult.data?.id) {
    return { data: null, error: userResult.error ?? "No active user session." };
  }

  const { data, error } = await supabase
    .from("canvas_images")
    .select("id, title, status, temp_storage_path, export_storage_path, thumbnail_path, created_at, updated_at")
    .eq("user_id", userResult.data.id)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  const items = await Promise.all(
    ((data as CanvasEditorRecord[] | null) ?? []).map(async (session) => ({
      id: session.id,
      name: session.title?.trim() || "Untitled Canvas",
      path: session.id,
      createdAt: session.updated_at ?? session.created_at ?? null,
      thumbnailUrl: await getCanvasSessionPreviewUrl(session),
    }))
  );

  return {
    data: items,
    error: null,
  };
}

async function getStoragePreviewUrl(bucket: string, path: string) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

function sanitizeFileName(value: string) {
  return value.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
}

async function getCanvasSessionPreviewUrl(session: CanvasEditorRecord) {
  const primaryPath = session.thumbnail_path ?? session.export_storage_path ?? session.temp_storage_path;

  if (!primaryPath) {
    return null;
  }

  if (session.thumbnail_path || session.export_storage_path) {
    return getStoragePreviewUrl(GRAPHIC_EXPORTS_BUCKET, primaryPath);
  }

  return getStoragePreviewUrl(GRAPHIC_TEMP_BUCKET, primaryPath);
}
