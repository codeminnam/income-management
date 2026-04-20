import { FormEvent } from 'react';

type InputSectionProps = {
  dateInput: string;
  cashInput: string;
  onlineInput: string;
  formMessage: string;
  backupMessage: string;
  isExporting: boolean;
  isImporting: boolean;
  isBackupBusy: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDateInputChange: (value: string) => void;
  onAdjustDateInput: (offsetDays: number) => void;
  onCashInputChange: (value: string) => void;
  onOnlineInputChange: (value: string) => void;
  onExport: () => Promise<void>;
  onImport: (event: FormEvent<HTMLInputElement>) => Promise<void>;
};

const InputSection = ({
  dateInput,
  cashInput,
  onlineInput,
  formMessage,
  backupMessage,
  isExporting,
  isImporting,
  isBackupBusy,
  onSubmit,
  onDateInputChange,
  onAdjustDateInput,
  onCashInputChange,
  onOnlineInputChange,
  onExport,
  onImport,
}: InputSectionProps) => (
  <form className="input-card" onSubmit={onSubmit}>
    <h2>Add Income Record</h2>
    <div className="input-main-row">
      <div className="field-row">
        <label>
          Date
          <div className="date-input-group">
            <button
              type="button"
              className="date-stepper"
              onClick={() => onAdjustDateInput(-1)}
              aria-label="Previous date"
            >
              -
            </button>
            <input
              type="text"
              inputMode="numeric"
              placeholder="yyyy/mm/dd"
              maxLength={10}
              value={dateInput}
              onChange={(event) => onDateInputChange(event.target.value)}
              required
            />
            <button
              type="button"
              className="date-stepper"
              onClick={() => onAdjustDateInput(1)}
              aria-label="Next date"
            >
              +
            </button>
          </div>
        </label>
        <label>
          Cash (GBP)
          <input
            type="number"
            min={0}
            step="0.01"
            value={cashInput}
            onChange={(event) => onCashInputChange(event.target.value)}
            required
          />
        </label>
        <label>
          Online Deposit (GBP)
          <input
            type="number"
            min={0}
            step="0.01"
            value={onlineInput}
            onChange={(event) => onOnlineInputChange(event.target.value)}
            required
          />
        </label>
      </div>

      <div className="input-actions-inline">
        <button type="submit" className="save-button">
          Save
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={onExport}
          disabled={isBackupBusy}
        >
          {isExporting ? 'Processing…' : 'Export Excel'}
        </button>
        <label
          className={`file-button ${isBackupBusy ? 'is-disabled' : ''}`}
          aria-disabled={isBackupBusy}
        >
          {isImporting ? 'Processing…' : 'Import Excel'}
          <input
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            disabled={isBackupBusy}
            onInput={onImport}
          />
        </label>
      </div>
    </div>
    <p className="form-message">{formMessage}</p>
    <p className="backup-message">{backupMessage}</p>
  </form>
);

export default InputSection;
