import { z } from "zod";

/**
 * Username/password đơn giản theo CLAUDE.md: không cần xác thực email/SĐT.
 * Ràng buộc đủ dùng để tránh input rác, không cần phức tạp hơn cho MVP.
 */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
  .max(32, "Tên đăng nhập tối đa 32 ký tự.")
  .regex(/^[a-zA-Z0-9_.]+$/, "Tên đăng nhập chỉ gồm chữ, số, dấu gạch dưới hoặc dấu chấm.");

// Mức "trung bình": tối thiểu 8 ký tự + có cả chữ lẫn số — không bắt ký tự
// đặc biệt/chữ hoa, không chặn mật khẩu phổ biến, không bắt nhập lại. Áp dụng
// khi TẠO mật khẩu mới (đăng ký, đổi mật khẩu) — KHÔNG áp dụng cho đăng nhập
// (`loginInputSchema` bên dưới), để user đã đăng ký từ trước lúc còn rule cũ
// (chỉ cần 6 ký tự) không bị khoá tài khoản.
export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
  .max(72, "Mật khẩu tối đa 72 ký tự.") // 72 bytes là giới hạn của bcrypt
  .refine((value) => /[a-zA-Z]/.test(value), "Mật khẩu phải có ít nhất 1 chữ cái.")
  .refine((value) => /[0-9]/.test(value), "Mật khẩu phải có ít nhất 1 chữ số.");

export const registerInputSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const loginInputSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập tên hiển thị.")
  .max(60, "Tên hiển thị tối đa 60 ký tự.");

// Không dùng chung regex điện thoại nghiêm ngặt của listing (contact) — đây
// là thông tin hồ sơ cá nhân, có thể là SĐT hoặc tên Zalo, để lỏng hơn.
export const phoneOrZaloSchema = z.string().trim().max(60, "Tối đa 60 ký tự.");

export const updateProfileInputSchema = z.object({
  displayName: displayNameSchema.optional(),
  phoneOrZalo: phoneOrZaloSchema.optional(),
});

export const updatePasswordInputSchema = z.object({
  newPassword: passwordSchema,
});
