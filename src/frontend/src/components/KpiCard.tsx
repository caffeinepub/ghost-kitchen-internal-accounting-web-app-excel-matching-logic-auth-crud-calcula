import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  format: 'currency' | 'percent';
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export default function KpiCard({ title, value, format, icon: Icon, variant = 'default' }: KpiCardProps) {
  const formattedValue =
    format === 'currency' ? `$${value.toFixed(2)}` : `${value.toFixed(1)}%`;

  const colorClasses = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  const bgClasses = {
    default: 'bg-muted',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    destructive: 'bg-destructive/10',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${bgClasses[variant]}`}>
          <Icon className={`h-4 w-4 ${colorClasses[variant]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClasses[variant]}`}>{formattedValue}</div>
      </CardContent>
    </Card>
  );
}
