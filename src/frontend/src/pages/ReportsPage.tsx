import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate financial reports and summaries</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          Advanced reporting features are currently being developed. This section will provide comprehensive financial
          reports including daily summaries, monthly P&L statements, and annual overviews.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Planned Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Daily Summary Report</li>
            <li>Monthly Expense Report</li>
            <li>Monthly Profit & Loss Statement</li>
            <li>3-Month Rolling Report</li>
            <li>6-Month Rolling Report</li>
            <li>12-Month Rolling Report</li>
            <li>Annual Summary Report</li>
            <li>Print-friendly layouts for all reports</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
