type TimePeriod = "currentMonth" | "previousMonth" | "allTime";

type SpendingTrendTimePeriod = "last6Months" | "currentYear" | "allTime";

interface GetDashboardSummaryParams {
  userId: string;
  timePeriod: TimePeriod;
}

interface GetSpendingTrendsParams {
  userId: string;
  timePeriod: SpendingTrendTimePeriod;
}

interface GetSpendingByCategoryParams {
  userId: string;
  timePeriod: TimePeriod;
}

interface GetUpcomingFinancialEventsParams {
  userId: string;
  limit: number;
  daysAhead: number;
  isActive: boolean | undefined;
}

export type {
  GetDashboardSummaryParams,
  TimePeriod,
  SpendingTrendTimePeriod,
  GetSpendingTrendsParams,
  GetSpendingByCategoryParams,
  GetUpcomingFinancialEventsParams,
};
