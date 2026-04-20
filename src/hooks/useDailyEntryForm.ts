import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from 'react';
import {
  addDaysToDateKey,
  APP_START_KEY,
  clampToAppStart,
  formatDateInput,
  MAX_DAILY_INCOME,
  type DailyIncomeRecord,
  normalizeDateKey,
} from '../utils/timeTrackingHelpers';

type UseDailyEntryFormParams = {
  todayDateKey: string;
  setRecords: Dispatch<SetStateAction<Record<string, DailyIncomeRecord>>>;
};

export const useDailyEntryForm = ({
  todayDateKey,
  setRecords,
}: UseDailyEntryFormParams) => {
  const [dateInput, setDateInput] = useState(todayDateKey);
  const [cashInput, setCashInput] = useState('0');
  const [onlineInput, setOnlineInput] = useState('0');
  const [formMessage, setFormMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedDate = normalizeDateKey(dateInput);
    if (!normalizedDate) {
      setFormMessage('Use yyyy/mm/dd for the date format.');
      return;
    }

    if (normalizedDate < APP_START_KEY) {
      setFormMessage('Date must be on or after 2025/04/01.');
      return;
    }

    const parsedCash = Number(cashInput);
    const parsedOnline = Number(onlineInput);

    if (!Number.isFinite(parsedCash) || parsedCash < 0 || parsedCash > MAX_DAILY_INCOME) {
      setFormMessage(`Cash must be a number between 0 and ${MAX_DAILY_INCOME}.`);
      return;
    }

    if (!Number.isFinite(parsedOnline) || parsedOnline < 0 || parsedOnline > MAX_DAILY_INCOME) {
      setFormMessage(`Online deposit must be a number between 0 and ${MAX_DAILY_INCOME}.`);
      return;
    }

    setFormMessage('');
    setRecords((previous) => ({
      ...previous,
      [normalizedDate]: {
        cash: Number(parsedCash.toFixed(2)),
        online: Number(parsedOnline.toFixed(2)),
      },
    }));
  };

  const adjustDateInput = (offsetDays: number) => {
    const baseDateKey =
      normalizeDateKey(dateInput) ?? clampToAppStart(todayDateKey);
    const adjustedDateKey = addDaysToDateKey(baseDateKey, offsetDays);
    setDateInput(clampToAppStart(adjustedDateKey));
    setFormMessage('');
  };

  const handleDateInputChange = (value: string) => {
    setDateInput(formatDateInput(value));
  };

  return {
    dateInput,
    cashInput,
    onlineInput,
    formMessage,
    setCashInput,
    setOnlineInput,
    handleSubmit,
    adjustDateInput,
    handleDateInputChange,
  };
};
