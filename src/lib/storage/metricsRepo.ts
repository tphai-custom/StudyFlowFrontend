import { apiGet } from "@/src/lib/api/client";

export type PlanMetrics = {
  range: "day" | "week" | "month";
  rangeStart: string;
  rangeEnd: string;
  totalSessions: number;
  doneSessions: number;
  completionRate: number;
  feasibilityScore: number;
  feasibilityReasons: string[];
  planVersion: number | null;
};

export async function getPlanMetrics(
  range: "day" | "week" | "month" = "week",
  date?: string,
): Promise<PlanMetrics> {
  const params = new URLSearchParams({ range });
  if (date) params.set("date", date);
  return apiGet<PlanMetrics>(`/metrics/plan?${params}`);
}
