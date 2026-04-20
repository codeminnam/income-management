import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { CompareMetric, DailyIncomeRecord, RangeType } from '../components';
import {
  APP_START_KEY,
  addDaysToDateKey,
  addMonthsToDateKey,
  addYearsToDateKey,
  clampToAppStart,
  getMonthStart,
  getWeekStartMonday,
  getYearStart,
  toMonthInputValue,
  toWeekInputValue,
  toYearInputValue,
  weekInputToDateKey,
  yearInputToDateKey,
} from '../utils/timeTrackingHelpers';

type UsePeriodNavigationParams = {
  range: RangeType;
  setRange: (next: RangeType) => void;
  compareMetric: CompareMetric;
  setCompareMetric: Dispatch<SetStateAction<CompareMetric>>;
  records: Record<string, DailyIncomeRecord>;
  todayDateKey: string;
};

export const usePeriodNavigation = ({
  range,
  setRange,
  compareMetric,
  setCompareMetric,
  records,
  todayDateKey,
}: UsePeriodNavigationParams) => {
  const [periodCursorKey, setPeriodCursorKey] = useState(() =>
    clampToAppStart(todayDateKey),
  );
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false);
  const [periodPickerInput, setPeriodPickerInput] = useState('');
  const [monthJumpYear, setMonthJumpYear] = useState('2025');
  const [monthJumpMonth, setMonthJumpMonth] = useState('04');
  const [yearJumpValue, setYearJumpValue] = useState('2025');
  const periodNavRef = useRef<HTMLDivElement | null>(null);

  const yearOptions = useMemo(() => {
    const sourceYears = new Set<number>();

    Object.keys(records).forEach((key) => {
      const parsed = Number(key.slice(0, 4));
      if (Number.isFinite(parsed)) {
        sourceYears.add(parsed);
      }
    });

    sourceYears.add(Number(APP_START_KEY.slice(0, 4)));
    sourceYears.add(Number(todayDateKey.slice(0, 4)));
    sourceYears.add(Number(periodCursorKey.slice(0, 4)));

    const years = Array.from(sourceYears);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return Array.from({ length: maxYear - minYear + 1 }, (_, index) =>
      String(minYear + index),
    );
  }, [periodCursorKey, records, todayDateKey]);

  const defaultPeriodPickerInput = useMemo(() => {
    if (range === 'week') {
      return toWeekInputValue(periodCursorKey);
    }

    if (range === 'month') {
      return toMonthInputValue(periodCursorKey);
    }

    return toYearInputValue(periodCursorKey);
  }, [periodCursorKey, range]);

  const periodTitle = useMemo(() => {
    if (range === 'compare') {
      return `Year Compare · ${compareMetric === 'average' ? 'Average' : 'Total'}`;
    }

    if (range === 'week') {
      const weekStart = getWeekStartMonday(periodCursorKey);
      const weekEnd = addDaysToDateKey(weekStart, 6);
      return `${weekStart} - ${weekEnd}`;
    }

    if (range === 'year') {
      const [year] = getYearStart(periodCursorKey).split('/');
      return year;
    }

    const [year, month] = getMonthStart(periodCursorKey).split('/').map(Number);
    return `${year}/${month}`;
  }, [compareMetric, periodCursorKey, range]);

  const movePeriod = (direction: 'prev' | 'next') => {
    if (range === 'compare') {
      return;
    }

    const delta = direction === 'prev' ? -1 : 1;
    setPeriodCursorKey((previous) => {
      if (range === 'week') {
        return clampToAppStart(addDaysToDateKey(previous, delta * 7));
      }

      if (range === 'year') {
        return clampToAppStart(addYearsToDateKey(previous, delta));
      }

      return clampToAppStart(addMonthsToDateKey(previous, delta));
    });
  };

  const jumpToToday = () => {
    if (range === 'compare') {
      return;
    }

    setPeriodCursorKey(clampToAppStart(todayDateKey));
  };

  const togglePeriodPicker = () => {
    if (range === 'compare') {
      setCompareMetric((previous) =>
        previous === 'average' ? 'total' : 'average',
      );
      return;
    }

    setIsPeriodPickerOpen((previous) => {
      if (!previous && range === 'week') {
        setPeriodPickerInput(defaultPeriodPickerInput);
      }
      return !previous;
    });
  };

  const applyPeriodPicker = () => {
    if (range === 'week') {
      const parsed = weekInputToDateKey(periodPickerInput);
      if (parsed) {
        setPeriodCursorKey(clampToAppStart(parsed));
        setIsPeriodPickerOpen(false);
      }
      return;
    }

    if (range === 'month') {
      setPeriodCursorKey(
        clampToAppStart(`${monthJumpYear}/${monthJumpMonth}/01`),
      );
      setIsPeriodPickerOpen(false);
      return;
    }

    const parsed = yearInputToDateKey(yearJumpValue);
    if (parsed) {
      setPeriodCursorKey(clampToAppStart(parsed));
      setIsPeriodPickerOpen(false);
    }
  };

  const isPeriodNavigable = range !== 'compare';

  const handleCompareTabClick = () => {
    if (range === 'compare') {
      setCompareMetric((previous) =>
        previous === 'average' ? 'total' : 'average',
      );
      return;
    }

    setRange('compare');
  };

  useEffect(() => {
    if (isPeriodPickerOpen) {
      if (range === 'week') {
        setPeriodPickerInput(defaultPeriodPickerInput);
      }

      if (range === 'month') {
        const [year, month] = getMonthStart(periodCursorKey).split('/');
        setMonthJumpYear(year);
        setMonthJumpMonth(month);
      }

      if (range === 'year') {
        const [year] = getYearStart(periodCursorKey).split('/');
        setYearJumpValue(year);
      }
    }
  }, [defaultPeriodPickerInput, isPeriodPickerOpen, periodCursorKey, range]);

  useEffect(() => {
    if (!isPeriodPickerOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!periodNavRef.current?.contains(target)) {
        setIsPeriodPickerOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPeriodPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPeriodPickerOpen]);

  return {
    periodCursorKey,
    periodNavRef,
    isPeriodPickerOpen,
    periodPickerInput,
    monthJumpYear,
    monthJumpMonth,
    yearJumpValue,
    yearOptions,
    periodTitle,
    isPeriodNavigable,
    setPeriodPickerInput,
    setMonthJumpYear,
    setMonthJumpMonth,
    setYearJumpValue,
    movePeriod,
    jumpToToday,
    togglePeriodPicker,
    applyPeriodPicker,
    handleCompareTabClick,
  };
};
