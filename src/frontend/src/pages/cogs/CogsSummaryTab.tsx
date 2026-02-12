import { useState } from 'react';
import { useCogsTotal, useCogsTrends } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import NumericCell from '../../components/NumericCell';
import { formatYearMonthBucket, compareYearMonthBuckets, yearMonthBucketToKey } from './utils';

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

  const { 
    data: totalCogs = 0, 
    isLoading: totalLoading, 
    isError: totalError,
    error: totalErrorObj,
    refetch: refetchTotal 
  } = useCogsTotal(startTimestamp, endTimestamp);
  
  const { 
    data: trends = [], 
    isLoading: trendsLoading,
    isError: trendsError,
    error: trendsErrorObj,
    refetch: refetchTrends
  } = useCogsTrends();

  const isLoading = totalLoading || trendsLoading;
  const hasError = totalError || trendsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Summary & Trends</h2>
          <p className="text-sm text-muted-foreground">View COGS totals and trends over time</p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading COGS Data</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              {totalError && `Total COGS: ${totalErrorObj?.message || 'Failed to load'}`}
              {totalError && trendsError && ' | '}
              {trendsError && `Trends: ${trendsErrorObj?.message || 'Failed to load'}`}
            </p>
            <div className="flex gap-2">
              {totalError && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchTotal()}
                >
                  Retry Total
                </Button>
              )}
              {trendsError && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchTrends()}
                >
                  Retry Trends
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
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
                    .slice()
                    .sort((a, b) => compareYearMonthBuckets(a[0], b[0]))
                    .map(([bucket, amount]) => {
                      const monthYear = formatYearMonthBucket(bucket);
                      const key = yearMonthBucketToKey(bucket);
                      return (
                        <TableRow key={key}>
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
