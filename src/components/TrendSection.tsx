import type {
  ChartItem,
  IncomeViewMode,
  PeriodDirection,
  RangeType,
  SummaryItem,
} from './types';
import { formatDisplayNumber } from '../utils/timeTrackingHelpers';

type TrendSectionProps = {
  range: RangeType;
  incomeViewMode: IncomeViewMode;
  onIncomeViewModeChange: (mode: IncomeViewMode) => void;
  summaryItems: SummaryItem[];
  chartItems: ChartItem[];
  maxValue: number;
  isPeriodNavigable: boolean;
  onMovePeriod: (direction: PeriodDirection) => void;
};

const TrendSection = ({
  range,
  incomeViewMode,
  onIncomeViewModeChange,
  summaryItems,
  chartItems,
  maxValue,
  isPeriodNavigable,
  onMovePeriod,
}: TrendSectionProps) => {
  const yAxisStep = 100;
  const yAxisMax = Math.max(yAxisStep, Math.ceil(maxValue / yAxisStep) * yAxisStep);
  const yAxisValues = Array.from(
    { length: Math.floor(yAxisMax / yAxisStep) + 1 },
    (_, index) => yAxisMax - index * yAxisStep,
  );

  return (
    <div className="chart-card" aria-label="Income trend chart">
      <div
        className="summary-row"
        style={{
          gridTemplateColumns: `repeat(${summaryItems.length}, minmax(0, 1fr))`,
        }}
      >
        {summaryItems.map((item) => (
          <div key={item.label}>
            <span className="summary-label">{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="bar-legend" aria-label="Income category legend">
        <div className="view-mode-toggle" role="tablist" aria-label="Select view mode">
          <button
            type="button"
            role="tab"
            aria-selected={incomeViewMode === 'both'}
            className={incomeViewMode === 'both' ? 'is-active' : ''}
            onClick={() => onIncomeViewModeChange('both')}
          >
            Both
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={incomeViewMode === 'cash'}
            className={incomeViewMode === 'cash' ? 'is-active' : ''}
            onClick={() => onIncomeViewModeChange('cash')}
          >
            Cash Only
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={incomeViewMode === 'online'}
            className={incomeViewMode === 'online' ? 'is-active' : ''}
            onClick={() => onIncomeViewModeChange('online')}
          >
            Online Only
          </button>
        </div>

        {(incomeViewMode === 'both' || incomeViewMode === 'cash') && (
          <span>
            <i className="legend-swatch legend-cash" aria-hidden="true" />
            Cash
          </span>
        )}
        {(incomeViewMode === 'both' || incomeViewMode === 'online') && (
          <span>
            <i className="legend-swatch legend-online" aria-hidden="true" />
            Online Deposit
          </span>
        )}
      </div>

      <div className="chart-nav-layout">
        <button
          type="button"
          className="chart-side-arrow"
          onClick={() => onMovePeriod('prev')}
          disabled={!isPeriodNavigable}
          aria-label="Previous period"
        >
          ‹
        </button>

        <div className="chart-center-layout">
          <div className="y-axis-scale" aria-hidden="true">
            {yAxisValues.map((value) => (
              <span
                key={value}
                className={`y-axis-tick ${value === yAxisMax ? 'is-top' : ''} ${value === 0 ? 'is-bottom' : ''}`}
                style={{ top: `${((yAxisMax - value) / yAxisMax) * 100}%` }}
              >
                {value}
              </span>
            ))}
          </div>

          <div className="chart-plot-area" aria-hidden="true">
            <div className="y-grid-lines">
              {yAxisValues.map((value) => (
                <span
                  key={value}
                  className="y-grid-line"
                  style={{ top: `${((yAxisMax - value) / yAxisMax) * 100}%` }}
                />
              ))}
            </div>
          </div>

          <div
            className={`chart-grid chart-grid-${range}`}
            style={
              range === 'month' || range === 'compare'
                ? {
                    gridTemplateColumns: `repeat(${chartItems.length}, minmax(0, 1fr))`,
                  }
                : undefined
            }
          >
            {chartItems.map((item) => {
              const displayValue =
                incomeViewMode === 'cash'
                  ? item.cash
                  : incomeViewMode === 'online'
                    ? item.online
                    : item.total;
              const clampedValue = Math.min(displayValue, yAxisMax);
              const heightRatio = clampedValue / yAxisMax;
              const barHeight = displayValue === 0 ? 0 : Math.max(4, heightRatio * 100);
              const cashRatio = item.total === 0 ? 0 : (item.cash / item.total) * 100;
              const onlineRatio = item.total === 0 ? 0 : (item.online / item.total) * 100;
              return (
                <div className="chart-column" key={item.dateKey}>
                  <div className="bar-track">
                    {incomeViewMode === 'both' ? (
                      <div
                        className={`bar-fill stacked ${item.isExcluded ? 'is-muted' : ''}`}
                        style={{ height: `${barHeight}%` }}
                        title={`${item.dateKey}: cash ${formatDisplayNumber(item.cash)} / online ${formatDisplayNumber(item.online)}`}
                      >
                        <div className="bar-segment bar-segment-cash" style={{ height: `${cashRatio}%` }} />
                        <div className="bar-segment bar-segment-online" style={{ height: `${onlineRatio}%` }} />
                      </div>
                    ) : (
                      <div
                        className={`bar-fill ${incomeViewMode === 'cash' ? 'cash-only' : 'online-only'} ${item.isExcluded ? 'is-muted' : ''}`}
                        style={{ height: `${barHeight}%` }}
                        title={`${item.dateKey}: ${incomeViewMode === 'cash' ? 'cash' : 'online'} ${formatDisplayNumber(displayValue)}`}
                      />
                    )}
                  </div>
                  <span className={`bar-value ${item.isExcluded ? 'is-muted' : ''}`}>
                    {formatDisplayNumber(displayValue)}
                  </span>
                  <span className={`bar-label ${item.isExcluded ? 'is-muted' : ''}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="chart-side-arrow"
          onClick={() => onMovePeriod('next')}
          disabled={!isPeriodNavigable}
          aria-label="Next period"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default TrendSection;
