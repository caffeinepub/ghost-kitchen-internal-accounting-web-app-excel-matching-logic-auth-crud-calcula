import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type TimeWindow = 'day' | 'month' | '3months' | '6months' | '12months';

interface TimeWindowSelectorProps {
  value: TimeWindow;
  onChange: (value: TimeWindow) => void;
}

export default function TimeWindowSelector({ value, onChange }: TimeWindowSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="day">Current Day</SelectItem>
        <SelectItem value="month">Current Month</SelectItem>
        <SelectItem value="3months">Last 3 Months</SelectItem>
        <SelectItem value="6months">Last 6 Months</SelectItem>
        <SelectItem value="12months">Last 12 Months</SelectItem>
      </SelectContent>
    </Select>
  );
}
