import { useEffect, useState } from 'react';
import {
  type DailyIncomeRecord,
  createInitialData,
  readStoredRecords,
  STORAGE_KEY,
} from '../utils/timeTrackingHelpers';

export const useRecordsStore = () => {
  const [records, setRecords] = useState<Record<string, DailyIncomeRecord>>(() => {
    return readStoredRecords() ?? createInitialData();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  return {
    records,
    setRecords,
  };
};
