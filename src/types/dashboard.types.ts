type TimePeriod = "currentMonth" | "previousMonth" | "allTime";

interface GetDashboardSummaryParams {
  userId: string;
  timePeriod: TimePeriod;
}

export type { GetDashboardSummaryParams, TimePeriod };
