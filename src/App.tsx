import { useMemo, useState } from 'react';
import './App.css';
import {
  InputSection,
  type IncomeViewMode,
  PanelHeader,
  PeriodNavigation,
  RangeTabs,
  TrendSection,
  type CompareMetric,
  type RangeType,
} from './components';
import {
  useBackupIO,
  useDailyEntryForm,
  usePeriodNavigation,
  useRecordsStore,
  useSummaryAnalytics,
  useTimeSeriesChart,
} from './hooks';
import { getUkTodayDateKey } from './utils/timeTrackingHelpers';

const App = () => {
  const todayDateKey = useMemo(() => getUkTodayDateKey(), []);
  const [range, setRange] = useState<RangeType>('month');
  const [incomeViewMode, setIncomeViewMode] = useState<IncomeViewMode>('both');
  const { records, setRecords } = useRecordsStore();
  const [compareMetric, setCompareMetric] = useState<CompareMetric>('average');

  const {
    backupMessage,
    isExporting,
    isImporting,
    isBackupBusy,
    handleExport,
    handleImport,
  } = useBackupIO({
    records,
    setRecords,
    todayDateKey,
  });

  const {
    dateInput,
    cashInput,
    onlineInput,
    formMessage,
    setCashInput,
    setOnlineInput,
    handleSubmit,
    adjustDateInput,
    handleDateInputChange,
  } = useDailyEntryForm({
    todayDateKey,
    setRecords,
  });

  const {
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
  } = usePeriodNavigation({
    range,
    setRange,
    compareMetric,
    setCompareMetric,
    records,
    todayDateKey,
  });

  const { chartItems, maxValue, averageValue } = useTimeSeriesChart({
    range,
    compareMetric,
    incomeViewMode,
    periodCursorKey,
    records,
    todayDateKey,
  });

  const { summaryItems } = useSummaryAnalytics({
    range,
    compareMetric,
    incomeViewMode,
    periodCursorKey,
    todayDateKey,
    records,
    averageValue,
  });

  return (
    <main className="app-shell">
      <section className="panel">
        <PanelHeader
          title="Income Management"
          description=""
        />

        <RangeTabs
          range={range}
          onRangeChange={setRange}
          onCompareTabClick={handleCompareTabClick}
        />
        <PeriodNavigation
          range={range}
          periodNavRef={periodNavRef}
          isPeriodNavigable={isPeriodNavigable}
          periodTitle={periodTitle}
          isPeriodPickerOpen={isPeriodPickerOpen}
          periodPickerInput={periodPickerInput}
          onPeriodPickerInputChange={setPeriodPickerInput}
          monthJumpYear={monthJumpYear}
          monthJumpMonth={monthJumpMonth}
          onMonthJumpYearChange={setMonthJumpYear}
          onMonthJumpMonthChange={setMonthJumpMonth}
          yearJumpValue={yearJumpValue}
          onYearJumpValueChange={setYearJumpValue}
          yearOptions={yearOptions}
          onMovePeriod={movePeriod}
          onTogglePeriodPicker={togglePeriodPicker}
          onJumpToToday={jumpToToday}
          onApplyPeriodPicker={applyPeriodPicker}
        />
        <TrendSection
          range={range}
          incomeViewMode={incomeViewMode}
          onIncomeViewModeChange={setIncomeViewMode}
          summaryItems={summaryItems}
          chartItems={chartItems}
          maxValue={maxValue}
          isPeriodNavigable={isPeriodNavigable}
          onMovePeriod={movePeriod}
        />
        <InputSection
          dateInput={dateInput}
          cashInput={cashInput}
          onlineInput={onlineInput}
          formMessage={formMessage}
          backupMessage={backupMessage}
          isExporting={isExporting}
          isImporting={isImporting}
          isBackupBusy={isBackupBusy}
          onSubmit={handleSubmit}
          onDateInputChange={handleDateInputChange}
          onAdjustDateInput={adjustDateInput}
          onCashInputChange={setCashInput}
          onOnlineInputChange={setOnlineInput}
          onExport={handleExport}
          onImport={handleImport}
        />
      </section>
    </main>
  );
};

export default App;
