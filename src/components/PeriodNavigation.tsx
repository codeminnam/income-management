import { RefObject } from 'react';
import { padTwo } from '../utils/timeTrackingHelpers';
import type { PeriodDirection, RangeType } from './types';

type PeriodNavigationProps = {
  range: RangeType;
  periodNavRef: RefObject<HTMLDivElement>;
  isPeriodNavigable: boolean;
  periodTitle: string;
  isPeriodPickerOpen: boolean;
  periodPickerInput: string;
  onPeriodPickerInputChange: (value: string) => void;
  monthJumpYear: string;
  monthJumpMonth: string;
  onMonthJumpYearChange: (value: string) => void;
  onMonthJumpMonthChange: (value: string) => void;
  yearJumpValue: string;
  onYearJumpValueChange: (value: string) => void;
  yearOptions: string[];
  onMovePeriod: (direction: PeriodDirection) => void;
  onTogglePeriodPicker: () => void;
  onJumpToToday: () => void;
  onApplyPeriodPicker: () => void;
};

const PeriodNavigation = ({
  range,
  periodNavRef,
  isPeriodNavigable,
  periodTitle,
  isPeriodPickerOpen,
  periodPickerInput,
  onPeriodPickerInputChange,
  monthJumpYear,
  monthJumpMonth,
  onMonthJumpYearChange,
  onMonthJumpMonthChange,
  yearJumpValue,
  onYearJumpValueChange,
  yearOptions,
  onMovePeriod,
  onTogglePeriodPicker,
  onJumpToToday,
  onApplyPeriodPicker,
}: PeriodNavigationProps) => {
  return (
    <div className="period-nav-wrap" ref={periodNavRef}>
      <div className="period-nav" aria-label="Navigate period">
        <div className="period-actions">
          <button
            type="button"
            onClick={() => onMovePeriod('prev')}
            disabled={!isPeriodNavigable}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onMovePeriod('next')}
            disabled={!isPeriodNavigable}
          >
            Next
          </button>
        </div>
        <button
          type="button"
          className="period-title-button"
          onClick={onTogglePeriodPicker}
        >
          {periodTitle}
        </button>
        <button
          type="button"
          className="today-button"
          onClick={onJumpToToday}
          disabled={!isPeriodNavigable}
        >
          Today
        </button>
      </div>

      {isPeriodPickerOpen ? (
        <div className="period-picker">
          {range === 'week' ? (
            <input
              type="week"
              value={periodPickerInput}
              onChange={(event) => onPeriodPickerInputChange(event.target.value)}
            />
          ) : null}

          {range === 'month' ? (
            <>
              <select
                value={monthJumpYear}
                onChange={(event) => onMonthJumpYearChange(event.target.value)}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                value={monthJumpMonth}
                onChange={(event) => onMonthJumpMonthChange(event.target.value)}
              >
                {Array.from({ length: 12 }, (_, index) =>
                  padTwo(index + 1),
                ).map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          {range === 'year' ? (
            <select
              value={yearJumpValue}
              onChange={(event) => onYearJumpValueChange(event.target.value)}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          ) : null}

          <button type="button" onClick={onApplyPeriodPicker}>
            Go
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default PeriodNavigation;
