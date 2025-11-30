interface DateRangePickerProps {
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;
  error: string | null;
  disabled?: boolean;
  maxDate: string;
}

export function DateRangePicker({
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  error,
  disabled,
  maxDate,
}: DateRangePickerProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <CalendarIcon />
        <label className="text-sm font-medium">Período de consulta</label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="fechaDesde" className="block text-xs text-muted-foreground">
            Desde
          </label>
          <input
            id="fechaDesde"
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            disabled={disabled}
            max={fechaHasta}
            className="block w-full rounded border border-border bg-background px-3 py-2 text-sm focus-ring disabled:opacity-50 dark:[color-scheme:dark]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="fechaHasta" className="block text-xs text-muted-foreground">
            Hasta
          </label>
          <input
            id="fechaHasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
            disabled={disabled}
            min={fechaDesde}
            max={maxDate}
            className="block w-full rounded border border-border bg-background px-3 py-2 text-sm focus-ring disabled:opacity-50 dark:[color-scheme:dark]"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <ErrorIcon />
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Máximo 1 año de consulta. Por defecto: año actual.
      </p>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4 text-primary dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

