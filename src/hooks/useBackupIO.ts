import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from 'react';
import {
  type DailyIncomeRecord,
  recordsToSheetRows,
  sheetRowsToRecords,
} from '../utils/timeTrackingHelpers';

type UseBackupIOParams = {
  records: Record<string, DailyIncomeRecord>;
  setRecords: Dispatch<SetStateAction<Record<string, DailyIncomeRecord>>>;
  todayDateKey: string;
};

export const useBackupIO = ({
  records,
  setRecords,
  todayDateKey,
}: UseBackupIOParams) => {
  const [backupMessage, setBackupMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setBackupMessage('Exporting Excel…');

    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(recordsToSheetRows(records), {
        header: ['date', 'cash', 'online', 'total'],
      });

      XLSX.utils.book_append_sheet(workbook, worksheet, 'records');
      XLSX.writeFile(
        workbook,
        `income-records-${todayDateKey.replace(/\//g, '-')}.xlsx`,
      );

      setBackupMessage('Excel file downloaded.');
    } catch {
      setBackupMessage('Export failed: please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: FormEvent<HTMLInputElement>) => {
    const fileInput = event.currentTarget;
    const selectedFile = fileInput.files?.[0];

    if (!selectedFile) {
      return;
    }

    setIsImporting(true);
    setBackupMessage('Importing Excel…');

    try {
      const XLSX = await import('xlsx');
      const binary = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(binary, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error('empty_sheet');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
        header: 1,
        raw: true,
      });

      const imported = sheetRowsToRecords(rows, XLSX.SSF.parse_date_code);
      if (!imported) {
        throw new Error('invalid_file');
      }

      setRecords(imported);
      setBackupMessage('Import completed.');
    } catch {
      setBackupMessage('Import failed: check the date / cash / online format.');
    } finally {
      setIsImporting(false);
      fileInput.value = '';
    }
  };

  return {
    backupMessage,
    isExporting,
    isImporting,
    isBackupBusy: isExporting || isImporting,
    handleExport,
    handleImport,
  };
};
