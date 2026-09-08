import type { FeedCursor } from "./types";

/**
 * Encode/decode cursor phân trang feed — base64 của JSON, không cần mã hoá
 * gì thêm (không chứa dữ liệu nhạy cảm, chỉ điểm số + id tin). Colocate
 * riêng file này (thay vì để thẳng trong `service.ts`) vì cả domain service
 * lẫn route handler `/api/bang-tin` đều cần decode cursor từ query string.
 */
export function encodeFeedCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeFeedCursor(raw: string): FeedCursor | undefined {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.score === "number" &&
      typeof parsed.lastId === "string" &&
      typeof parsed.now === "string"
    ) {
      return { score: parsed.score, lastId: parsed.lastId, now: parsed.now };
    }
    return undefined;
  } catch {
    return undefined;
  }
}
