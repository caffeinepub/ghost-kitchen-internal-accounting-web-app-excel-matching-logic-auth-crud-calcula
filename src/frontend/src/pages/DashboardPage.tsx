import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useDashboardData } from '../hooks/useQueries';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Receipt, Package, Percent } from 'lucide-react';
import TimeWindowSelector, { type TimeWindow } from '../components/TimeWindowSelector';
import KpiCard from '../components/KpiCard';

export default function DashboardPage() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('month');
  const { data, isLoading } = useDashboardData(timeWindow);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { totalRevenue, totalExpenses, netProfit, profitMargin, cogs } = data || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    cogs: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Financial overview and key performance indicators</p>
        </div>
        <TimeWindowSelector value={timeWindow} onChange={setTimeWindow} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Net Profit"
          value={netProfit}
          format="currency"
          icon={netProfit >= 0 ? TrendingUp : TrendingDown}
          variant={netProfit >= 0 ? 'success' : 'destructive'}
        />
        <KpiCard title="Total Revenue" value={totalRevenue} format="currency" icon={DollarSign} variant="default" />
        <KpiCard title="Total Expenses" value={totalExpenses} format="currency" icon={Receipt} variant="default" />
        <KpiCard
          title="Profit Margin"
          value={profitMargin}
          format="percent"
          icon={Percent}
          variant={profitMargin >= 20 ? 'success' : profitMargin >= 10 ? 'warning' : 'destructive'}
        />
        <KpiCard title="COGS" value={cogs} format="currency" icon={Package} variant="default" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">Revenue</span>
              <span className="text-sm font-semibold">${totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">Expenses</span>
              <span className="text-sm font-semibold text-destructive">-${totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">COGS</span>
              <span className="text-sm font-semibold">${cogs.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-base font-semibold">Net Profit</span>
              <span className={`text-base font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                ${netProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
