"use client";

import { track } from "@vercel/analytics";

/**
 * Wrapper chuẩn hoá tên custom event — tránh gõ tay chuỗi rải rác ở nhiều
 * component, dễ soát lại toàn bộ event đang bắn khi cần.
 */
export const AnalyticsEvent = {
  SavedSearchCreated: "saved_search_created",
  PassConfirmed: "pass_confirmed",
  ReturningVisit: "returning_visit",
} as const;

export function trackEvent(event: (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent]) {
  track(event);
}
