import type { OverallStats } from './types';
import { formatDisplayNumber } from '../utils/timeTrackingHelpers';

type StatsSectionProps = {
  overallStats: OverallStats;
};

const StatsSection = ({ overallStats }: StatsSectionProps) => {
  return (
    <div className="chart-card stats-chart-card" aria-label="Record summary">
      <div className="stats-grid">
        <div className="stats-item">
          <span className="summary-label">All-time max daily income</span>
          <strong>{formatDisplayNumber(overallStats.maxDailyIncome)}</strong>
        </div>
        <div className="stats-item">
          <span className="summary-label">Longest active streak</span>
          <strong>
            {overallStats.longestActiveStreak} days (
            {overallStats.longestActiveRangeLabel})
          </strong>
        </div>
        <div className="stats-item">
          <span className="summary-label">Longest inactive streak</span>
          <strong>
            {overallStats.longestInactiveStreak} days (
            {overallStats.longestInactiveRangeLabel})
          </strong>
        </div>
        <div className="stats-item">
          <span className="summary-label">Best weekly average income</span>
          <strong>
            {overallStats.bestWeekLabel === '-'
              ? '-'
              : `${overallStats.bestWeekLabel} (avg ${formatDisplayNumber(overallStats.bestWeekAverageIncome)})`}
          </strong>
        </div>
        <div className="stats-item">
          <span className="summary-label">Best monthly average income</span>
          <strong>
            {overallStats.bestMonthLabel === '-'
              ? '-'
              : `${overallStats.bestMonthLabel} (avg ${formatDisplayNumber(overallStats.bestMonthAverageIncome)})`}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
