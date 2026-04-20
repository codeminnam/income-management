import {
  addDaysToDateKey,
  addMonthsToDateKey,
  addYearsToDateKey,
  EXCLUDE_BEFORE_KEY,
  formatDisplayNumber,
  fromDateKey,
  getMonthDays,
  getMonthStart,
  getWeekStartMonday,
  getYearStart,
} from './timeTrackingHelpers';
import type { DailyIncomeRecord } from '../components';

type RangeType = 'week' | 'month' | 'year' | 'compare';
type IncomeViewMode = 'both' | 'cash' | 'online';

export type PeriodMetrics = {
  totalIncome: number;
  totalCash: number;
  totalOnline: number;
  maxDailyIncome: number;
  maxDailyCash: number;
  maxDailyOnline: number;
  activeDayCount: number;
  inactiveDayCount: number;
  longestActiveStreak: number;
  longestInactiveStreak: number;
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

export const calculatePeriodDayKeys = ({
  range,
  periodCursorKey,
  todayDateKey,
}: {
  range: RangeType;
  periodCursorKey: string;
  todayDateKey: string;
}) => {
  let startKey = EXCLUDE_BEFORE_KEY;
  let endKey = todayDateKey;

  if (range === 'week') {
    startKey = getWeekStartMonday(periodCursorKey);
    endKey = addDaysToDateKey(startKey, 6);
  } else if (range === 'month') {
    startKey = getMonthStart(periodCursorKey);
    endKey = addDaysToDateKey(startKey, getMonthDays(startKey) - 1);
  } else if (range === 'year') {
    startKey = getYearStart(periodCursorKey);
    const nextYearStart = addYearsToDateKey(startKey, 1);
    endKey = addDaysToDateKey(nextYearStart, -1);
  }

  const clampedStart = startKey < EXCLUDE_BEFORE_KEY ? EXCLUDE_BEFORE_KEY : startKey;
  const clampedEnd = endKey > todayDateKey ? todayDateKey : endKey;

  if (clampedStart > clampedEnd) {
    return [] as string[];
  }

  const keys: string[] = [];
  let cursor = clampedStart;

  while (cursor <= clampedEnd) {
    keys.push(cursor);
    cursor = addDaysToDateKey(cursor, 1);
  }

  return keys;
};

export const calculatePeriodMetrics = ({
  periodDayKeys,
  records,
}: {
  periodDayKeys: string[];
  records: Record<string, DailyIncomeRecord>;
}): PeriodMetrics => {
  if (periodDayKeys.length === 0) {
    return {
      totalIncome: 0,
      totalCash: 0,
      totalOnline: 0,
      maxDailyIncome: 0,
      maxDailyCash: 0,
      maxDailyOnline: 0,
      activeDayCount: 0,
      inactiveDayCount: 0,
      longestActiveStreak: 0,
      longestInactiveStreak: 0,
    };
  }

  let totalCash = 0;
  let totalOnline = 0;
  let maxDailyIncome = 0;
  let maxDailyCash = 0;
  let maxDailyOnline = 0;
  let activeDayCount = 0;
  let inactiveDayCount = 0;
  let longestActiveStreak = 0;
  let longestInactiveStreak = 0;
  let currentActiveStreak = 0;
  let currentInactiveStreak = 0;

  periodDayKeys.forEach((dateKey) => {
    const row = records[dateKey] ?? { cash: 0, online: 0 };
    const value = row.cash + row.online;
    totalCash += row.cash;
    totalOnline += row.online;

    if (row.cash > maxDailyCash) {
      maxDailyCash = row.cash;
    }

    if (row.online > maxDailyOnline) {
      maxDailyOnline = row.online;
    }

    if (value > maxDailyIncome) {
      maxDailyIncome = value;
    }

    if (value > 0) {
      activeDayCount += 1;
      currentActiveStreak += 1;
      currentInactiveStreak = 0;
    } else {
      inactiveDayCount += 1;
      currentInactiveStreak += 1;
      currentActiveStreak = 0;
    }

    if (currentActiveStreak > longestActiveStreak) {
      longestActiveStreak = currentActiveStreak;
    }

    if (currentInactiveStreak > longestInactiveStreak) {
      longestInactiveStreak = currentInactiveStreak;
    }
  });

  return {
    totalIncome: Number((totalCash + totalOnline).toFixed(2)),
    totalCash: Number(totalCash.toFixed(2)),
    totalOnline: Number(totalOnline.toFixed(2)),
    maxDailyIncome: Number(maxDailyIncome.toFixed(2)),
    maxDailyCash: Number(maxDailyCash.toFixed(2)),
    maxDailyOnline: Number(maxDailyOnline.toFixed(2)),
    activeDayCount,
    inactiveDayCount,
    longestActiveStreak,
    longestInactiveStreak,
  };
};

export const buildSummaryItems = ({
  summaryLabel,
  incomeViewMode,
  averageValue,
  periodMetrics,
}: {
  summaryLabel: string;
  incomeViewMode: IncomeViewMode;
  averageValue: number;
  periodMetrics: PeriodMetrics;
}) => {
  if (incomeViewMode === 'cash') {
    return [
      { label: summaryLabel, value: formatDisplayNumber(averageValue) },
      { label: 'Total cash', value: formatDisplayNumber(periodMetrics.totalCash) },
      { label: 'Max daily cash', value: formatDisplayNumber(periodMetrics.maxDailyCash) },
    ];
  }

  if (incomeViewMode === 'online') {
    return [
      { label: summaryLabel, value: formatDisplayNumber(averageValue) },
      {
        label: 'Total online deposit',
        value: formatDisplayNumber(periodMetrics.totalOnline),
      },
      {
        label: 'Max daily online deposit',
        value: formatDisplayNumber(periodMetrics.maxDailyOnline),
      },
    ];
  }

  const baseItems = [
    { label: summaryLabel, value: formatDisplayNumber(averageValue) },
    { label: 'Total income', value: formatDisplayNumber(periodMetrics.totalIncome) },
    { label: 'Cash', value: formatDisplayNumber(periodMetrics.totalCash) },
    { label: 'Online deposit', value: formatDisplayNumber(periodMetrics.totalOnline) },
    { label: 'Max daily income', value: formatDisplayNumber(periodMetrics.maxDailyIncome) },
  ];

  return baseItems;
};

export const calculateOverallStats = ({
  records,
  todayDateKey,
}: {
  records: Record<string, DailyIncomeRecord>;
  todayDateKey: string;
}): OverallStats => {
  const allDayKeys: string[] = [];
  let dayCursor = EXCLUDE_BEFORE_KEY;

  while (dayCursor <= todayDateKey) {
    allDayKeys.push(dayCursor);
    dayCursor = addDaysToDateKey(dayCursor, 1);
  }

  if (allDayKeys.length === 0) {
    return {
      maxDailyIncome: 0,
      longestActiveStreak: 0,
      longestActiveRangeLabel: '-',
      longestInactiveStreak: 0,
      longestInactiveRangeLabel: '-',
      bestWeekLabel: '-',
      bestWeekAverageIncome: 0,
      bestMonthLabel: '-',
      bestMonthAverageIncome: 0,
    };
  }

  let maxDailyIncome = 0;
  let longestActiveStreak = 0;
  let longestInactiveStreak = 0;
  let currentActiveStreak = 0;
  let currentInactiveStreak = 0;
  let currentActiveStartKey = '';
  let currentInactiveStartKey = '';
  let longestActiveStartKey = '';
  let longestActiveEndKey = '';
  let longestInactiveStartKey = '';
  let longestInactiveEndKey = '';

  allDayKeys.forEach((dateKey) => {
    const row = records[dateKey] ?? { cash: 0, online: 0 };
    const value = row.cash + row.online;

    if (value > maxDailyIncome) {
      maxDailyIncome = value;
    }

    if (value > 0) {
      if (currentActiveStreak === 0) {
        currentActiveStartKey = dateKey;
      }
      currentActiveStreak += 1;
      currentInactiveStreak = 0;
    } else {
      if (currentInactiveStreak === 0) {
        currentInactiveStartKey = dateKey;
      }
      currentInactiveStreak += 1;
      currentActiveStreak = 0;
    }

    if (currentActiveStreak > longestActiveStreak) {
      longestActiveStreak = currentActiveStreak;
      longestActiveStartKey = currentActiveStartKey;
      longestActiveEndKey = dateKey;
    }

    if (currentInactiveStreak > longestInactiveStreak) {
      longestInactiveStreak = currentInactiveStreak;
      longestInactiveStartKey = currentInactiveStartKey;
      longestInactiveEndKey = dateKey;
    }
  });

  const firstWeekStart = getWeekStartMonday(EXCLUDE_BEFORE_KEY);
  let weekCursor = firstWeekStart;
  let bestWeekAverageIncome = -1;
  let bestWeekStartKey = '';

  while (weekCursor <= todayDateKey) {
    let weeklyTotal = 0;
    let weeklyCount = 0;

    for (let index = 0; index < 7; index += 1) {
      const dateKey = addDaysToDateKey(weekCursor, index);
      if (dateKey < EXCLUDE_BEFORE_KEY || dateKey > todayDateKey) {
        continue;
      }

      const row = records[dateKey] ?? { cash: 0, online: 0 };
      weeklyTotal += row.cash + row.online;
      weeklyCount += 1;
    }

    if (weeklyCount > 0) {
      const weeklyAverage = weeklyTotal / weeklyCount;
      if (weeklyAverage > bestWeekAverageIncome) {
        bestWeekAverageIncome = weeklyAverage;
        bestWeekStartKey = weekCursor;
      }
    }

    weekCursor = addDaysToDateKey(weekCursor, 7);
  }

  let bestWeekLabel = '-';
  if (bestWeekStartKey) {
    const weekStartDate = fromDateKey(bestWeekStartKey);
    const year = weekStartDate.getUTCFullYear();
    const month = weekStartDate.getUTCMonth() + 1;
    const weekOfMonth = Math.floor((weekStartDate.getUTCDate() - 1) / 7) + 1;
    bestWeekLabel = `${year}/${month} week ${weekOfMonth}`;
  }

  const firstMonthStart = getMonthStart(EXCLUDE_BEFORE_KEY);
  let monthCursor = firstMonthStart;
  let bestMonthAverageIncome = -1;
  let bestMonthStartKey = '';

  while (monthCursor <= todayDateKey) {
    const monthDays = getMonthDays(monthCursor);
    let monthlyTotal = 0;
    let monthlyCount = 0;

    for (let day = 0; day < monthDays; day += 1) {
      const dateKey = addDaysToDateKey(monthCursor, day);
      if (dateKey < EXCLUDE_BEFORE_KEY || dateKey > todayDateKey) {
        continue;
      }

      const row = records[dateKey] ?? { cash: 0, online: 0 };
      monthlyTotal += row.cash + row.online;
      monthlyCount += 1;
    }

    if (monthlyCount > 0) {
      const monthlyAverage = monthlyTotal / monthlyCount;
      if (monthlyAverage > bestMonthAverageIncome) {
        bestMonthAverageIncome = monthlyAverage;
        bestMonthStartKey = monthCursor;
      }
    }

    monthCursor = addMonthsToDateKey(monthCursor, 1);
  }

  let bestMonthLabel = '-';
  if (bestMonthStartKey) {
    const monthStartDate = fromDateKey(bestMonthStartKey);
    bestMonthLabel = `${monthStartDate.getUTCFullYear()}/${monthStartDate.getUTCMonth() + 1}`;
  }

  return {
    maxDailyIncome: Number(maxDailyIncome.toFixed(2)),
    longestActiveStreak,
    longestActiveRangeLabel:
      longestActiveStartKey && longestActiveEndKey
        ? `${longestActiveStartKey} ~ ${longestActiveEndKey}`
        : '-',
    longestInactiveStreak,
    longestInactiveRangeLabel:
      longestInactiveStartKey && longestInactiveEndKey
        ? `${longestInactiveStartKey} ~ ${longestInactiveEndKey}`
        : '-',
    bestWeekLabel,
    bestWeekAverageIncome:
      bestWeekAverageIncome < 0 ? 0 : Number(bestWeekAverageIncome.toFixed(2)),
    bestMonthLabel,
    bestMonthAverageIncome:
      bestMonthAverageIncome < 0 ? 0 : Number(bestMonthAverageIncome.toFixed(2)),
  };
};
