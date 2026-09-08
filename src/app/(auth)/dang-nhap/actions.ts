"use server";

import { redirect } from "next/navigation";
import { getRepositories } from "@/infra/container";
import { authenticateUser } from "@/domain/auth/service";
import { createSession } from "@/infra/session/session";
import { AppError } from "@/domain/shared/errors";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function loginAction(input: { username: string; password: string }): Promise<ActionResult> {
  let userId: string;
  try {
    const repos = getRepositories();
    const user = await authenticateUser(repos.auth, input);
    userId = user.id;
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
  }

  await createSession(userId);
  redirect("/");
}
