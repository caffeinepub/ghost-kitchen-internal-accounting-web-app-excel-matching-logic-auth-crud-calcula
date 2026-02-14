import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function CredentialLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">FoodBooks</CardTitle>
          <CardDescription>Authentication System Update</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This page is no longer part of the authentication flow. The application now uses Internet Identity exclusively for secure, principal-based authentication.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
