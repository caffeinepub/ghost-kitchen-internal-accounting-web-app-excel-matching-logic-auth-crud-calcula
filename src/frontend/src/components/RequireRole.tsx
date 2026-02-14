import { useGetCallerUserRole } from '../hooks/useEmployeeAuth';
import { UserRole } from '../backend';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Loader2 } from 'lucide-react';

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { data: userRole, isLoading } = useGetCallerUserRole();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Treat guest role as unauthorized
  if (!userRole || userRole === UserRole.guest || !allowedRoles.includes(userRole)) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}
