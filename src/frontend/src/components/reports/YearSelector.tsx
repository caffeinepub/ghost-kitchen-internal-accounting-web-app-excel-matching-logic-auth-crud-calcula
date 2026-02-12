import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface YearSelectorProps {
  year: number;
  onChange: (year: number) => void;
}

export default function YearSelector({ year, onChange }: YearSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Year</label>
      <Select value={year.toString()} onValueChange={(value) => onChange(parseInt(value))}>
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
  );
}
