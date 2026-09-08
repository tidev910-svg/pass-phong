import "server-only";
import { cookies, headers } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/infra/supabase/server-client";
import { getRepositories } from "@/infra/container";
import type { PublicUser } from "@/domain/auth/types";
import { toPublicUser } from "@/domain/auth/types";

const SESSION_COOKIE = "session_token";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày
const LAST_SEEN_THROTTLE_MS = 60 * 60 * 1000; // chỉ update last_seen_at mỗi 1h/user

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Request THẬT có phải HTTPS không — dùng `x-forwarded-proto` (Vercel/mọi
 * reverse proxy chuẩn đều set header này) thay vì đoán qua
 * `NODE_ENV === "production"`. 2 thứ này KHÔNG tương đương: build production
 * chạy local qua `next start` (vd test trên điện thoại thật qua IP LAN,
 * `http://192.168.x.x:3000`) vẫn có `NODE_ENV=production` nhưng KHÔNG có
 * HTTPS — cookie `Secure` bị trình duyệt (Safari lẫn Chrome, đúng theo spec)
 * âm thầm từ chối lưu trên kết nối HTTP, session coi như không bao giờ lưu
 * được dù đăng nhập server-side vẫn thành công (đúng triệu chứng "đăng nhập
 * không lưu được session" gặp phải khi test qua LAN). Trên Vercel thật,
 * request luôn qua edge proxy của Vercel nên header này luôn có và luôn
 * "https" — hành vi production không đổi gì so với trước.
 */
async function isSecureRequest(): Promise<boolean> {
  const headerList = await headers();
  return headerList.get("x-forwarded-proto") === "https";
}

/**
 * Session lưu ở bảng `sessions` (không dùng JWT) để có thể thu hồi ngay khi
 * logout — quy mô MVP không đáng ngại 1 lần lookup DB/request.
 */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const client = getSupabaseServerClient();
  const { error } = await client
    .from("sessions")
    .insert({ user_id: userId, token_hash: hashToken(token), expires_at: expiresAt.toISOString() });
  if (error) throw error;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: await isSecureRequest(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSession(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const client = getSupabaseServerClient();
  const { data: session, error } = await client
    .from("sessions")
    .select("user_id, expires_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (error) throw error;
  if (!session || new Date(session.expires_at) < new Date()) return null;

  const { auth } = getRepositories();
  const user = await auth.findById(session.user_id);
  if (!user) return null;

  maybeTouchLastSeen(user.id, user.lastSeenAt);

  return toPublicUser(user);
}

/** Không await — không chặn request chỉ để cập nhật 1 cột thống kê. */
function maybeTouchLastSeen(userId: string, lastSeenAt: string | null) {
  const shouldTouch = !lastSeenAt || Date.now() - new Date(lastSeenAt).getTime() > LAST_SEEN_THROTTLE_MS;
  if (!shouldTouch) return;
  const { auth } = getRepositories();
  void auth.touchLastSeen(userId);
}

/** Dùng ở layout/`Server Action` cần bắt buộc đăng nhập — redirect nếu chưa. */
export async function requireSession(): Promise<PublicUser> {
  const user = await getSession();
  if (!user) redirect("/dang-nhap");
  return user;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const client = getSupabaseServerClient();
    await client.from("sessions").delete().eq("token_hash", hashToken(token));
  }
  cookieStore.delete(SESSION_COOKIE);
}
