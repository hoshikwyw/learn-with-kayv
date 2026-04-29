import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type UploadResult =
  | { ok: true; publicUrl: string }
  | { ok: false; error: string };

/**
 * Validates the incoming File from a multipart form action.
 * Returns null if no file was provided (i.e. the user didn't pick one).
 */
export function validateImage(
  file: FormDataEntryValue | null,
  maxBytes: number,
):
  | { kind: "missing" }
  | { kind: "ok"; file: File; ext: string }
  | { kind: "error"; message: string } {
  if (!(file instanceof File) || file.size === 0) {
    return { kind: "missing" };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return {
      kind: "error",
      message: "Image must be JPG, PNG or WebP.",
    };
  }
  if (file.size > maxBytes) {
    const mb = Math.floor(maxBytes / (1024 * 1024));
    return {
      kind: "error",
      message: `Image is too large. Max ${mb}MB.`,
    };
  }
  const ext = EXT_BY_MIME[file.type];
  return { kind: "ok", file, ext };
}

/**
 * Uploads a file to Supabase Storage. Removes any previous files in the
 * same folder first so that the row never accumulates orphans across
 * different file extensions.
 */
export async function uploadImage(
  supabase: SupabaseClient,
  bucket: string,
  folder: string,
  file: File,
  ext: string,
): Promise<UploadResult> {
  // Wipe the folder so re-uploading with a different extension doesn't leave junk.
  const { data: existing } = await supabase.storage.from(bucket).list(folder);
  if (existing && existing.length > 0) {
    await supabase.storage
      .from(bucket)
      .remove(existing.map((f) => `${folder}/${f.name}`));
  }

  const path = `${folder}/image.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadErr) {
    return { ok: false, error: uploadErr.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  // Cache-bust so the browser fetches the new image
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

  return { ok: true, publicUrl };
}
