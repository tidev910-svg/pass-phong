import type { UserRecord } from "./types";

export interface AuthRepository {
  findByUsername(username: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  createUser(data: { username: string; passwordHash: string }): Promise<UserRecord>;
  /** Cập nhật last_seen_at — dùng để đo tỷ lệ quay lại trong 7 ngày. */
  touchLastSeen(userId: string): Promise<void>;
  updateProfile(userId: string, data: { displayName?: string; phoneOrZalo?: string }): Promise<void>;
  /**
   * Ghi thẳng password_hash mới — KHÔNG đi qua `supabase.auth.updateUser()`
   * vì dự án tự viết auth riêng (bcrypt + bảng `users`), không dùng Supabase
   * Auth nên không có row nào trong `auth.users` để hàm đó cập nhật.
   */
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}
