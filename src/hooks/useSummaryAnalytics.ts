import { useMemo } from 'react';
import type {
  CompareMetric,
  DailyIncomeRecord,
  IncomeViewMode,
  RangeType,
} from '../components';
import {
  buildSummaryItems,
  calculateOverallStats,
  calculatePeriodDayKeys,
  calculatePeriodMetrics,
} from '../utils/analyticsHelpers';

type UseSummaryAnalyticsParams = {
  range: RangeType;
  compareMetric: CompareMetric;
  incomeViewMode: IncomeViewMode;
  periodCursorKey: string;
  todayDateKey: string;
  records: Record<string, DailyIncomeRecord>;
  averageValue: number;
};

export const useSummaryAnalytics = ({
  range,
  compareMetric,
  incomeViewMode,
  periodCursorKey,
  todayDateKey,
  records,
  averageValue,
}: UseSummaryAnalyticsParams) => {
  const periodDayKeys = useMemo(() => {
    return calculatePeriodDayKeys({
      range,
      periodCursorKey,
      todayDateKey,
    });
  }, [periodCursorKey, range, todayDateKey]);

  const periodMetrics = useMemo(() => {
    return calculatePeriodMetrics({ periodDayKeys, records });
  }, [periodDayKeys, records]);

  const summaryLabelPrefix =
    incomeViewMode === 'cash'
      ? 'cash'
      : incomeViewMode === 'online'
        ? 'online deposit'
        : 'income';

  const summaryLabel =
    range === 'compare'
      ? compareMetric === 'average'
        ? `Yearly average ${summaryLabelPrefix}`
        : `Yearly total ${summaryLabelPrefix}`
      : `Average ${summaryLabelPrefix}`;

  const summaryItems = useMemo(() => {
    return buildSummaryItems({
      summaryLabel,
      incomeViewMode,
      averageValue,
      periodMetrics,
    });
  }, [averageValue, incomeViewMode, periodMetrics, range, summaryLabel]);

  const overallStats = useMemo(() => {
    return calculateOverallStats({ records, todayDateKey });
  }, [records, todayDateKey]);

  return {
    summaryLabel,
    summaryItems,
    overallStats,
  };
};
