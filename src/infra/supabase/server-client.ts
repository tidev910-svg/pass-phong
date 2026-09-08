import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase DUY NHẤT dùng cho toàn bộ app — luôn bằng service role key,
 * chỉ được gọi từ server (Server Component/Server Action/Route Handler).
 * Không có biến NEXT_PUBLIC_* nào ở đây — không có gì để lộ ra client.
 *
 * RLS trên các bảng vẫn giữ bật (mặc định Supabase) nhưng không tạo policy
 * nào cho anon/authenticated: service role tự bypass RLS, còn nếu anon key
 * lỡ lộ ở đâu đó thì vẫn không đọc/ghi được gì (deny-by-default).
 */
let cachedClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY. Xem .env.example.",
    );
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}
