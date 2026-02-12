import { useState } from 'react';
import { useCogsTotal, useCogsTrends } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Loader2, TrendingUp } from 'lucide-react';
import { Label } from '../../components/ui/label';
import NumericCell from '../../components/NumericCell';

type TimeRange = 'month' | '3months' | '6months' | '12months';

export default function CogsSummaryTab() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case '3months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case '6months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
    case '12months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
      break;
  }

  const startTimestamp = BigInt(startDate.getTime() * 1000000);
  const endTimestamp = BigInt(now.getTime() * 1000000);

  const { data: totalCogs = 0, isLoading: totalLoading } = useCogsTotal(startTimestamp, endTimestamp);
  const { data: trends = [], isLoading: trendsLoading } = useCogsTrends();

  const isLoading = totalLoading || trendsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Summary & Trends</h2>
        <p className="text-sm text-muted-foreground">View COGS totals and trends over time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>COGS Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timeRange">Time Period</Label>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger id="timeRange" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Current Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border bg-muted/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total COGS</p>
                <p className="text-3xl font-bold">${totalCogs.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">COGS Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trends.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No trend data available yet. Record some sales to see trends.
                    </TableCell>
                  </TableRow>
                ) : (
                  trends
                    .sort((a, b) => Number(b[0] - a[0]))
                    .map(([bucket, amount]) => {
                      const date = new Date(Number(bucket) * 30 * 24 * 60 * 60 * 1000);
                      const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                      return (
                        <TableRow key={bucket.toString()}>
                          <TableCell className="font-medium">{monthYear}</TableCell>
                          <NumericCell value={amount} format="currency" />
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
