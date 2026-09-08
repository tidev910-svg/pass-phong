export interface UserRecord {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string | null;
  phoneOrZalo: string | null;
  isVerifiedStudent: boolean;
  /** true = bị admin khoá (web admin riêng) — chặn đăng nhập, xem `authenticateUser`. */
  isLocked: boolean;
  lastSeenAt: string | null;
  createdAt: string;
}

/** Thông tin user an toàn để trả ra UI (không có passwordHash). */
export interface PublicUser {
  id: string;
  username: string;
  displayName: string | null;
  phoneOrZalo: string | null;
  isVerifiedStudent: boolean;
  createdAt: string;
}

export interface RegisterInput {
  username: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

/** Không có field nào bắt buộc — chỉ gửi lên field nào người dùng thực sự đổi. */
export interface UpdateProfileInput {
  displayName?: string;
  phoneOrZalo?: string;
}

export interface UpdatePasswordInput {
  newPassword: string;
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    phoneOrZalo: user.phoneOrZalo,
    isVerifiedStudent: user.isVerifiedStudent,
    createdAt: user.createdAt,
  };
}
