import bcrypt from "bcryptjs";
import { ConflictError, ForbiddenError, UnauthorizedError, ValidationError } from "@/domain/shared/errors";
import type { AuthRepository } from "./repository";
import {
  loginInputSchema,
  registerInputSchema,
  updatePasswordInputSchema,
  updateProfileInputSchema,
} from "./validation";
import {
  toPublicUser,
  type LoginInput,
  type PublicUser,
  type RegisterInput,
  type UpdatePasswordInput,
  type UpdateProfileInput,
} from "./types";

const BCRYPT_COST = 12;

export async function registerUser(repo: AuthRepository, input: RegisterInput): Promise<PublicUser> {
  const parsed = registerInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }

  const existing = await repo.findByUsername(parsed.data.username);
  if (existing) {
    throw new ConflictError("Tên đăng nhập đã được sử dụng.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_COST);
  const user = await repo.createUser({ username: parsed.data.username, passwordHash });
  return toPublicUser(user);
}

export async function authenticateUser(repo: AuthRepository, input: LoginInput): Promise<PublicUser> {
  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }

  const user = await repo.findByUsername(parsed.data.username);
  if (!user) {
    throw new UnauthorizedError("Tên đăng nhập hoặc mật khẩu không đúng.");
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordMatches) {
    throw new UnauthorizedError("Tên đăng nhập hoặc mật khẩu không đúng.");
  }

  // Khoá tài khoản chỉ đổi được từ web admin riêng (PASS_PHONG_ADMIN, không
  // nằm trong repo này) — check ở đây là điểm chặn duy nhất cần thiết ở web
  // chính, loginAction đã bắt AppError sẵn nên không cần sửa gì thêm.
  if (user.isLocked) {
    throw new ForbiddenError("Tài khoản của bạn đã bị khoá. Liên hệ quản trị viên để biết thêm chi tiết.");
  }

  return toPublicUser(user);
}

export async function updateProfile(repo: AuthRepository, userId: string, input: UpdateProfileInput): Promise<void> {
  const parsed = updateProfileInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }
  await repo.updateProfile(userId, parsed.data);
}

/**
 * Đổi mật khẩu — hash lại bằng bcrypt rồi ghi thẳng `password_hash`, KHÔNG đi
 * qua Supabase Auth (xem comment ở `AuthRepository.updatePassword`).
 */
export async function updatePassword(repo: AuthRepository, userId: string, input: UpdatePasswordInput): Promise<void> {
  const parsed = updatePasswordInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_COST);
  await repo.updatePassword(userId, passwordHash);
}
