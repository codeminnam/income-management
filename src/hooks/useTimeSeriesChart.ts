import { useMemo } from 'react';
import type {
  CompareMetric,
  DailyIncomeRecord,
  IncomeViewMode,
  RangeType,
} from '../components';
import {
  addDaysToDateKey,
  addMonthsToDateKey,
  EXCLUDE_BEFORE_KEY,
  fromDateKey,
  getMonthDays,
  getMonthStart,
  getWeekStartMonday,
  getYearStart,
} from '../utils/timeTrackingHelpers';

type UseTimeSeriesChartParams = {
  range: RangeType;
  compareMetric: CompareMetric;
  incomeViewMode: IncomeViewMode;
  periodCursorKey: string;
  records: Record<string, DailyIncomeRecord>;
  todayDateKey: string;
};

const getDisplayValue = ({
  cash,
  online,
  incomeViewMode,
}: {
  cash: number;
  online: number;
  incomeViewMode: IncomeViewMode;
}) => {
  if (incomeViewMode === 'cash') {
    return cash;
  }

  if (incomeViewMode === 'online') {
    return online;
  }

  return cash + online;
};

export const useTimeSeriesChart = ({
  range,
  compareMetric,
  incomeViewMode,
  periodCursorKey,
  records,
  todayDateKey,
}: UseTimeSeriesChartParams) => {
  const chartItems = useMemo(() => {
    if (range === 'week') {
      const weekStart = getWeekStartMonday(periodCursorKey);
      return Array.from({ length: 7 }, (_, index) => {
        const dateKey = addDaysToDateKey(weekStart, index);
        const date = fromDateKey(dateKey);
        const row = records[dateKey] ?? { cash: 0, online: 0 };
        const total = Number((row.cash + row.online).toFixed(2));
        return {
          dateKey,
          cash: row.cash,
          online: row.online,
          total,
          label: `${date.getUTCDate()}`,
          isExcluded: dateKey < EXCLUDE_BEFORE_KEY || dateKey > todayDateKey,
        };
      });
    }

    if (range === 'month') {
      const monthStart = getMonthStart(periodCursorKey);
      const monthDays = getMonthDays(monthStart);
      return Array.from({ length: monthDays }, (_, index) => {
        const dateKey = addDaysToDateKey(monthStart, index);
        const date = fromDateKey(dateKey);
        const row = records[dateKey] ?? { cash: 0, online: 0 };
        const total = Number((row.cash + row.online).toFixed(2));
        return {
          dateKey,
          cash: row.cash,
          online: row.online,
          total,
          label: `${date.getUTCDate()}`,
          isExcluded: dateKey < EXCLUDE_BEFORE_KEY || dateKey > todayDateKey,
        };
      });
    }

    if (range === 'compare') {
      const yearlyBuckets = new Map<string, Array<{ cash: number; online: number }>>();

      Object.entries(records).forEach(([dateKey, row]) => {
        const isExcludedDate =
          dateKey < EXCLUDE_BEFORE_KEY || dateKey > todayDateKey;
        if (isExcludedDate) {
          return;
        }

        const year = dateKey.slice(0, 4);
        const bucket = yearlyBuckets.get(year) ?? [];
        bucket.push(row);
        yearlyBuckets.set(year, bucket);
      });

      return Array.from(yearlyBuckets.entries())
        .sort(([leftYear], [rightYear]) => leftYear.localeCompare(rightYear))
        .map(([year, values]) => {
          const totalCash = values.reduce((sum, current) => sum + current.cash, 0);
          const totalOnline = values.reduce((sum, current) => sum + current.online, 0);
          const totalIncome = totalCash + totalOnline;
          const cashMetric =
            compareMetric === 'average' && values.length > 0
              ? totalCash / values.length
              : totalCash;
          const onlineMetric =
            compareMetric === 'average' && values.length > 0
              ? totalOnline / values.length
              : totalOnline;
          const totalMetric =
            compareMetric === 'average' && values.length > 0
              ? totalIncome / values.length
              : totalIncome;

          return {
            dateKey: `${year}/01/01`,
            cash: Number(cashMetric.toFixed(2)),
            online: Number(onlineMetric.toFixed(2)),
            total: Number(totalMetric.toFixed(2)),
            label: year,
            isExcluded: false,
          };
        });
    }

    const yearStart = getYearStart(periodCursorKey);
    return Array.from({ length: 12 }, (_, index) => {
      const monthStart = addMonthsToDateKey(yearStart, index);
      const monthDays = getMonthDays(monthStart);
      let totalCash = 0;
      let totalOnline = 0;
      let includedDays = 0;

      for (let day = 0; day < monthDays; day += 1) {
        const dateKey = addDaysToDateKey(monthStart, day);
        const isExcludedDate =
          dateKey < EXCLUDE_BEFORE_KEY || dateKey > todayDateKey;
        if (isExcludedDate) {
          continue;
        }

        const row = records[dateKey] ?? { cash: 0, online: 0 };
        totalCash += row.cash;
        totalOnline += row.online;
        includedDays += 1;
      }

      const isExcludedMonth = includedDays === 0;
      const cashMetric = isExcludedMonth
        ? 0
        : compareMetric === 'average'
          ? totalCash / includedDays
          : totalCash;
      const onlineMetric = isExcludedMonth
        ? 0
        : compareMetric === 'average'
          ? totalOnline / includedDays
          : totalOnline;
      const totalMetric = cashMetric + onlineMetric;

      return {
        dateKey: monthStart,
        cash: Number(cashMetric.toFixed(2)),
        online: Number(onlineMetric.toFixed(2)),
        total: Number(totalMetric.toFixed(2)),
        label: `${index + 1}`,
        isExcluded: isExcludedMonth,
      };
    });
  }, [compareMetric, periodCursorKey, range, records, todayDateKey]);

  const maxValue = useMemo(() => {
    const values = chartItems
      .filter((item) => !item.isExcluded)
      .map((item) =>
        getDisplayValue({
          cash: item.cash,
          online: item.online,
          incomeViewMode,
        }),
      );
    if (values.length === 0) {
      return 1;
    }
    const observedMax = Math.max(...values);
    return Math.max(1, Math.ceil(observedMax) + 1);
  }, [chartItems, incomeViewMode]);

  const averageValue = useMemo(() => {
    const values = chartItems
      .filter((item) => !item.isExcluded)
      .map((item) =>
        getDisplayValue({
          cash: item.cash,
          online: item.online,
          incomeViewMode,
        }),
      );
    if (values.length === 0) {
      return 0;
    }
    const total = values.reduce((sum, value) => sum + value, 0);
    return Number((total / values.length).toFixed(2));
  }, [chartItems, incomeViewMode]);

  return {
    chartItems,
    maxValue,
    averageValue,
  };
};
