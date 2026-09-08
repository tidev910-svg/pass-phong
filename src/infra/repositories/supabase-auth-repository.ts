import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthRepository } from "@/domain/auth/repository";
import type { UserRecord } from "@/domain/auth/types";

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  display_name: string | null;
  phone_or_zalo: string | null;
  is_verified_student: boolean;
  is_locked: boolean;
  last_seen_at: string | null;
  created_at: string;
}

const USER_SELECT =
  "id, username, password_hash, display_name, phone_or_zalo, is_verified_student, is_locked, last_seen_at, created_at";

function toUserRecord(row: UserRow): UserRecord {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    phoneOrZalo: row.phone_or_zalo,
    isVerifiedStudent: row.is_verified_student,
    isLocked: row.is_locked,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
  };
}

export function createSupabaseAuthRepository(client: SupabaseClient): AuthRepository {
  return {
    async findByUsername(username) {
      const { data, error } = await client
        .from("users")
        .select(USER_SELECT)
        .eq("username", username)
        .maybeSingle();
      if (error) throw error;
      return data ? toUserRecord(data) : null;
    },

    async findById(id) {
      const { data, error } = await client.from("users").select(USER_SELECT).eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? toUserRecord(data) : null;
    },

    async createUser({ username, passwordHash }) {
      const { data, error } = await client
        .from("users")
        .insert({ username, password_hash: passwordHash })
        .select(USER_SELECT)
        .single();
      if (error) throw error;
      return toUserRecord(data);
    },

    async touchLastSeen(userId) {
      const { error } = await client
        .from("users")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;
    },

    async updateProfile(userId, data) {
      const patch: Record<string, string> = {};
      if (data.displayName !== undefined) patch.display_name = data.displayName;
      if (data.phoneOrZalo !== undefined) patch.phone_or_zalo = data.phoneOrZalo;
      if (Object.keys(patch).length === 0) return;

      const { error } = await client.from("users").update(patch).eq("id", userId);
      if (error) throw error;
    },

    async updatePassword(userId, passwordHash) {
      const { error } = await client.from("users").update({ password_hash: passwordHash }).eq("id", userId);
      if (error) throw error;
    },
  };
}
