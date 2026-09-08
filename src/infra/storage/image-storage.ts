import "server-only";
import { randomUUID } from "node:crypto";
import { getSupabaseServerClient } from "@/infra/supabase/server-client";

const BUCKET = "listing-images";

/**
 * Upload ảnh tin đăng — LUÔN đi qua server (Server Action) bằng service role
 * client, không cho client upload trực tiếp bằng signed URL, để giữ nguyên
 * tắc "mọi truy cập Supabase chỉ qua infra/".
 */
export async function uploadListingImage(file: File, listingId: string): Promise<string> {
  const client = getSupabaseServerClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${listingId}/${randomUUID()}.${extension}`;

  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw error;

  return path;
}

export function getListingImagePublicUrl(storagePath: string): string {
  const client = getSupabaseServerClient();
  const { data } = client.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
