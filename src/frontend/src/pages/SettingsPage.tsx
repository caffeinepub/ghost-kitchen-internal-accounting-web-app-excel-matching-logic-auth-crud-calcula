import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, AlertCircle, Users } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { UserRole } from '../backend';
import { useListUsers, useChangeUserRole } from '../hooks/useUserAdmin';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage user accounts and access control</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>View and manage user roles based on Internet Identity principals</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Users are automatically provisioned with the "Employee" role when they first sign in with Internet Identity. You can change their role here.
            </AlertDescription>
          </Alert>
          <UserList />
        </CardContent>
      </Card>
    </div>
  );
}

function UserList() {
  const { data: users, isLoading, error, refetch } = useListUsers();
  const { mutate: changeRole, isPending: isChangingRole } = useChangeUserRole();
  const [changingUserId, setChangingUserId] = useState<string | null>(null);

  const handleRoleChange = (userPrincipal: string, newRole: UserRole) => {
    setChangingUserId(userPrincipal);
    changeRole(
      { userPrincipal, newRole },
      {
        onSuccess: () => {
          setChangingUserId(null);
        },
        onError: (err: any) => {
          setChangingUserId(null);
          console.error('Failed to change role:', err);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load users. {error instanceof Error ? error.message : 'Please try again.'}
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users found. Users will appear here after they sign in with Internet Identity.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Principal ID</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isChanging = changingUserId === user.principal.toString();
            return (
              <TableRow key={user.principal.toString()}>
                <TableCell className="font-mono text-xs">{user.principal.toString()}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.role === UserRole.admin
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : user.role === UserRole.user
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {user.role === UserRole.admin ? 'Owner' : user.role === UserRole.user ? 'Employee' : 'Guest'}
                  </span>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.principal.toString(), value as UserRole)}
                    disabled={isChanging || isChangingRole}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.admin}>Owner</SelectItem>
                      <SelectItem value={UserRole.user}>Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  {isChanging && (
                    <Loader2 className="ml-2 inline h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
