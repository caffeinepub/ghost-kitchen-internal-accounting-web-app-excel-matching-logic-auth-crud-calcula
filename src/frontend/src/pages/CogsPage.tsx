import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export default function CogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cost of Goods Sold (COGS)</h1>
        <p className="text-muted-foreground">Track inventory costs and goods sold</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          COGS tracking functionality is currently being developed. This feature will allow you to track item costs,
          quantities, and vendor information for accurate cost of goods sold calculations.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Planned Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Track individual items and their costs</li>
            <li>Record quantities purchased and sold</li>
            <li>Link items to vendors</li>
            <li>Calculate total COGS for reporting</li>
            <li>View COGS trends over time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
