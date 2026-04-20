import type { RangeType } from './types';

type RangeTabsProps = {
  range: RangeType;
  onRangeChange: (next: RangeType) => void;
  onCompareTabClick: () => void;
};

const RangeTabs = ({
  range,
  onRangeChange,
  onCompareTabClick,
}: RangeTabsProps) => (
  <div className="range-toggle" role="tablist" aria-label="Select range">
    <button
      type="button"
      className={range === 'week' ? 'is-active' : ''}
      onClick={() => onRangeChange('week')}
    >
      Weekly
    </button>
    <button
      type="button"
      className={range === 'month' ? 'is-active' : ''}
      onClick={() => onRangeChange('month')}
    >
      Monthly
    </button>
    <button
      type="button"
      className={range === 'year' ? 'is-active' : ''}
      onClick={() => onRangeChange('year')}
    >
      Yearly
    </button>
    <button
      type="button"
      className={range === 'compare' ? 'is-active' : ''}
      onClick={onCompareTabClick}
    >
      Year Compare
    </button>
  </div>
);

export default RangeTabs;
