export const STORAGE_KEY = 'income-management-records-v1';
const DATE_KEY_REGEX = /^\d{4}\/\d{2}\/\d{2}$/;
const DATE_PARTS_REGEX = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
const UK_TIME_ZONE = 'Europe/London';
export const APP_START_KEY = '2025/04/01';
export const EXCLUDE_BEFORE_KEY = '2025/04/01';
export const MAX_DAILY_INCOME = 100000;

export type DailyIncomeRecord = {
  cash: number;
  online: number;
};

export const padTwo = (value: number) => {
  return String(value).padStart(2, '0');
};

export const formatDisplayNumber = (value: number) => {
  return value.toFixed(2).replace(/\.0+$|(?<=\.\d*[1-9])0+$/g, '');
};

export const normalizeDateKey = (raw: string) => {
  const normalized = raw.trim().replace(/[.-]/g, '/');
  const matched = normalized.match(DATE_PARTS_REGEX);
  if (!matched) {
    return null;
  }

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  const isValidDate =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day;

  if (!isValidDate) {
    return null;
  }

  const formatted = `${year}/${padTwo(month)}/${padTwo(day)}`;
  if (!DATE_KEY_REGEX.test(formatted)) {
    return null;
  }

  return formatted;
};

export const formatDateInput = (raw: string) => {
  if (/[\/.\-]/.test(raw)) {
    return raw
      .replace(/[.-]/g, '/')
      .replace(/[^\d/]/g, '')
      .replace(/\/{2,}/g, '/')
      .slice(0, 10);
  }

  const digits = raw.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6, 8)}`;
};

export const fromDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('/').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const toDateKeyFromUtcDate = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const getUkTodayDateKey = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: UK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    return '2026/01/01';
  }

  return `${year}/${month}/${day}`;
};

export const addDaysToDateKey = (dateKey: string, offset: number) => {
  const date = fromDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + offset);
  return toDateKeyFromUtcDate(date);
};

export const getWeekStartMonday = (dateKey: string) => {
  const date = fromDateKey(dateKey);
  const day = date.getUTCDay();
  const offsetFromMonday = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offsetFromMonday);
  return toDateKeyFromUtcDate(date);
};

export const getMonthStart = (dateKey: string) => {
  const date = fromDateKey(dateKey);
  date.setUTCDate(1);
  return toDateKeyFromUtcDate(date);
};

export const getMonthDays = (dateKey: string) => {
  const [year, month] = dateKey.split('/').map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

export const addMonthsToDateKey = (dateKey: string, offset: number) => {
  const date = fromDateKey(getMonthStart(dateKey));
  date.setUTCMonth(date.getUTCMonth() + offset);
  return toDateKeyFromUtcDate(date);
};

export const getYearStart = (dateKey: string) => {
  const date = fromDateKey(dateKey);
  date.setUTCMonth(0, 1);
  return toDateKeyFromUtcDate(date);
};

export const addYearsToDateKey = (dateKey: string, offset: number) => {
  const date = fromDateKey(getYearStart(dateKey));
  date.setUTCFullYear(date.getUTCFullYear() + offset);
  return toDateKeyFromUtcDate(date);
};

export const toMonthInputValue = (dateKey: string) => {
  const [year, month] = getMonthStart(dateKey).split('/');
  return `${year}-${month}`;
};

export const weekInputToDateKey = (value: string) => {
  const matched = value.match(/^(\d{4})-W(\d{2})$/);
  if (!matched) {
    return null;
  }

  const year = Number(matched[1]);
  const week = Number(matched[2]);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(week) ||
    week < 1 ||
    week > 53
  ) {
    return null;
  }

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Weekday = (jan4.getUTCDay() + 6) % 7;
  jan4.setUTCDate(jan4.getUTCDate() - jan4Weekday);
  jan4.setUTCDate(jan4.getUTCDate() + (week - 1) * 7);
  return toDateKeyFromUtcDate(jan4);
};

export const toWeekInputValue = (dateKey: string) => {
  const weekStart = fromDateKey(getWeekStartMonday(dateKey));
  const thursday = new Date(weekStart);
  thursday.setUTCDate(weekStart.getUTCDate() + 3);

  const isoYear = thursday.getUTCFullYear();
  const week1 = new Date(Date.UTC(isoYear, 0, 4));
  const week1Weekday = (week1.getUTCDay() + 6) % 7;
  week1.setUTCDate(week1.getUTCDate() - week1Weekday);

  const diffDays = Math.round(
    (weekStart.getTime() - week1.getTime()) / 86400000,
  );
  const isoWeek = Math.floor(diffDays / 7) + 1;

  return `${isoYear}-W${padTwo(isoWeek)}`;
};

export const toYearInputValue = (dateKey: string) => {
  const [year] = dateKey.split('/');
  return year;
};

export const yearInputToDateKey = (value: string) => {
  const matched = value.match(/^\d{4}$/);
  if (!matched) {
    return null;
  }

  return `${matched[0]}/01/01`;
};

export const clampToAppStart = (dateKey: string) => {
  return dateKey < APP_START_KEY ? APP_START_KEY : dateKey;
};

export const createInitialData = () => {
  return {} as Record<string, DailyIncomeRecord>;
};

export const sanitizeRecords = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const parsed = payload as Record<string, unknown>;
  const sanitized = Object.entries(parsed).reduce<Record<string, DailyIncomeRecord>>(
    (accumulator, [dateKey, value]) => {
      const normalizedDateKey = normalizeDateKey(dateKey);
      if (!normalizedDateKey) {
        return accumulator;
      }

      if (normalizedDateKey < APP_START_KEY) {
        return accumulator;
      }

      if (!value || typeof value !== 'object') {
        return accumulator;
      }

      const row = value as Record<string, unknown>;
      const cash =
        typeof row.cash === 'number' && Number.isFinite(row.cash)
          ? row.cash
          : 0;
      const online =
        typeof row.online === 'number' && Number.isFinite(row.online)
          ? row.online
          : 0;

      if (cash < 0 || online < 0 || cash > MAX_DAILY_INCOME || online > MAX_DAILY_INCOME) {
        return accumulator;
      }

      accumulator[normalizedDateKey] = {
        cash: Number(cash.toFixed(2)),
        online: Number(online.toFixed(2)),
      };
      return accumulator;
    },
    {},
  );

  return Object.keys(sanitized).length > 0 ? sanitized : null;
};

export const parseDateCell = (
  value: unknown,
  parseDateCode: (value: number) => { y: number; m: number; d: number } | null,
) => {
  if (typeof value === 'string') {
    return normalizeDateKey(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = parseDateCode(value);
    if (!parsed) {
      return null;
    }

    return `${parsed.y}/${padTwo(parsed.m)}/${padTwo(parsed.d)}`;
  }

  return null;
};

export const parseAmountCell = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const recordsToSheetRows = (records: Record<string, DailyIncomeRecord>) => {
  const todayKey = getUkTodayDateKey();
  const totalDays =
    Math.floor(
      (fromDateKey(todayKey).getTime() - fromDateKey(APP_START_KEY).getTime()) /
        86400000,
    ) + 1;

  return Array.from({ length: Math.max(totalDays, 1) }, (_, index) => {
    const date = addDaysToDateKey(APP_START_KEY, index);
    const row = records[date] ?? { cash: 0, online: 0 };

    return {
      date,
      cash: Number(row.cash.toFixed(2)),
      online: Number(row.online.toFixed(2)),
      total: Number((row.cash + row.online).toFixed(2)),
    };
  });
};

export const sheetRowsToRecords = (
  rows: unknown[][],
  parseDateCode: (value: number) => { y: number; m: number; d: number } | null,
) => {
  const [headerRow, ...dataRows] = rows;
  if (!headerRow || headerRow.length === 0) {
    return null;
  }

  const normalizedHeaders = headerRow.map((cell) =>
    typeof cell === 'string' ? cell.trim().toLowerCase() : '',
  );

  let dateIndex = normalizedHeaders.findIndex((header) =>
    ['date', 'datekey'].includes(header),
  );
  let cashIndex = normalizedHeaders.findIndex((header) =>
    ['cash'].includes(header),
  );
  let onlineIndex = normalizedHeaders.findIndex((header) =>
    ['online', 'online transfer', 'transfer'].includes(header),
  );

  if (dateIndex < 0) {
    if (headerRow.length >= 3) {
      dateIndex = 0;
    } else {
      return null;
    }
  }

  if (cashIndex < 0 || onlineIndex < 0) {
    if (headerRow.length >= 3) {
      cashIndex = 1;
      onlineIndex = 2;
    } else {
      return null;
    }
  }

  const imported = dataRows.reduce<Record<string, DailyIncomeRecord>>(
    (accumulator, row) => {
      if (!Array.isArray(row)) {
        return accumulator;
      }

      const dateKey = parseDateCell(row[dateIndex], parseDateCode);
      const cashValue = parseAmountCell(row[cashIndex]);
      const onlineValue = parseAmountCell(row[onlineIndex]);

      if (!dateKey || cashValue === null || onlineValue === null) {
        return accumulator;
      }

      if (
        cashValue < 0 ||
        onlineValue < 0 ||
        cashValue > MAX_DAILY_INCOME ||
        onlineValue > MAX_DAILY_INCOME
      ) {
        return accumulator;
      }

      accumulator[dateKey] = {
        cash: Number(cashValue.toFixed(2)),
        online: Number(onlineValue.toFixed(2)),
      };
      return accumulator;
    },
    {},
  );

  return sanitizeRecords(imported);
};

export const readStoredRecords = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return sanitizeRecords(parsed);
  } catch {
    return null;
  }
};
