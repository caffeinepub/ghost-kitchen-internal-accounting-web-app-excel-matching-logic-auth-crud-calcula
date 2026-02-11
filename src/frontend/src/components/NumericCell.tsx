import { TableCell } from './ui/table';

interface NumericCellProps {
  value: number;
  format: 'currency' | 'percent' | 'number';
  className?: string;
}

export default function NumericCell({ value, format, className = '' }: NumericCellProps) {
  let formattedValue = '';

  switch (format) {
    case 'currency':
      formattedValue = `$${value.toFixed(2)}`;
      break;
    case 'percent':
      formattedValue = `${value.toFixed(1)}%`;
      break;
    case 'number':
      formattedValue = value.toFixed(2);
      break;
  }

  return <TableCell className={`text-right font-mono ${className}`}>{formattedValue}</TableCell>;
}
