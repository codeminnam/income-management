export type RangeType = 'week' | 'month' | 'year' | 'compare';

export type CompareMetric = 'average' | 'total';

export type IncomeViewMode = 'both' | 'cash' | 'online';

export type PeriodDirection = 'prev' | 'next';

export type SummaryItem = {
  label: string;
  value: string;
};

export type DailyIncomeRecord = {
  cash: number;
  online: number;
};

export type ChartItem = {
  dateKey: string;
  cash: number;
  online: number;
  total: number;
  label: string;
  isExcluded: boolean;
};

export type OverallStats = {
  maxDailyIncome: number;
  longestActiveStreak: number;
  longestActiveRangeLabel: string;
  longestInactiveStreak: number;
  longestInactiveRangeLabel: string;
  bestWeekLabel: string;
  bestWeekAverageIncome: number;
  bestMonthLabel: string;
  bestMonthAverageIncome: number;
};
