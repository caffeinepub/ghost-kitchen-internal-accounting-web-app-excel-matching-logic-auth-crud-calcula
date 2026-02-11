import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Receipt, DollarSign, Package, Database, FileText, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { SiFacebook, SiX, SiLinkedin } from 'react-icons/si';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
    { path: '/revenue', label: 'Revenue', icon: DollarSign },
    { path: '/cogs', label: 'COGS', icon: Package },
    { path: '/master-data', label: 'Master Data', icon: Database },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="no-print border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold">Ghost Kitchen Accounting</h1>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="container mx-auto p-6">{children}</div>
      </main>

      {/* Footer */}
      <footer className="no-print border-t bg-card py-4">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ghost Kitchen Accounting • Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
