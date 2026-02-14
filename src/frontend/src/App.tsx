import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useGetCallerUserRole } from './hooks/useEmployeeAuth';
import { Loader2 } from 'lucide-react';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import RevenuePage from './pages/RevenuePage';
import CogsPage from './pages/CogsPage';
import MasterDataPage from './pages/MasterDataPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import RequireRole from './components/RequireRole';
import { UserRole } from './backend';

// Root layout component
function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: userRole, isLoading: roleLoading, isFetched: roleFetched } = useGetCallerUserRole();

  const isAuthenticated = !!identity;

  // Show loading during initialization
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show Internet Identity login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show loading while checking role from backend
  if (roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading while checking profile
  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show profile setup if authenticated but no profile
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;
  if (showProfileSetup) {
    return <ProfileSetupDialog />;
  }

  // Show main app
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

// Expenses route
const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses',
  component: ExpensesPage,
});

// Revenue route
const revenueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/revenue',
  component: RevenuePage,
});

// COGS route
const cogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cogs',
  component: CogsPage,
});

// Master Data route - Owner only
const masterDataRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/master-data',
  component: () => (
    <RequireRole allowedRoles={[UserRole.admin]}>
      <MasterDataPage />
    </RequireRole>
  ),
});

// Reports route
const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: ReportsPage,
});

// Settings route - Owner only
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <RequireRole allowedRoles={[UserRole.admin]}>
      <SettingsPage />
    </RequireRole>
  ),
});

// Create router
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  expensesRoute,
  revenueRoute,
  cogsRoute,
  masterDataRoute,
  reportsRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
