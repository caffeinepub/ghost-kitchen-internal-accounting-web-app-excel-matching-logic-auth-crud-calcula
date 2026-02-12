import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getEndMonthYear } from '../../lib/reports/dateRanges';

interface MultiMonthRangeSelectorProps {
  startMonth: number;
  startYear: number;
  onStartMonthChange: (month: number) => void;
  onStartYearChange: (year: number) => void;
  monthCount: 3 | 6;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export default function MultiMonthRangeSelector({
  startMonth,
  startYear,
  onStartMonthChange,
  onStartYearChange,
  monthCount,
}: MultiMonthRangeSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const { endYear, endMonth } = getEndMonthYear(startYear, startMonth, monthCount);
  const endMonthLabel = MONTHS.find((m) => m.value === endMonth)?.label || '';

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Month</label>
          <Select value={startMonth.toString()} onValueChange={(value) => onStartMonthChange(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Start Year</label>
          <Select value={startYear.toString()} onValueChange={(value) => onStartYearChange(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        <span className="font-medium">Selected range:</span> {MONTHS.find((m) => m.value === startMonth)?.label} {startYear} - {endMonthLabel} {endYear} ({monthCount} months)
      </div>
    </div>
  );
}
