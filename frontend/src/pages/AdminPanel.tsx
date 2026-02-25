import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import AdminDashboard from '../components/AdminDashboard';
import AdminProductsSection from '../components/AdminProductsSection';
import AdminCategoriesSection from '../components/AdminCategoriesSection';
import BulkProductImport from '../components/BulkProductImport';
import { Button } from '../components/ui/button';
import {
  LayoutDashboard,
  Package,
  LayoutGrid,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  ChevronRight,
  Upload,
} from 'lucide-react';

type AdminSection = 'dashboard' | 'products' | 'categories' | 'settings' | 'bulk-import';

const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Analytics overview' },
  { id: 'products', label: 'Products', icon: Package, description: 'Manage your products' },
  { id: 'categories', label: 'Categories', icon: LayoutGrid, description: 'Browse by category' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Admin settings' },
];

export default function AdminPanel() {
  const { identity, clear } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthenticated = !!identity;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  // Only block on authentication — never block on actorFetching
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-admin-bg gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  const principalShort = identity?.getPrincipal().toString().slice(0, 12) + '...';

  return (
    <div className="min-h-screen bg-admin-bg flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar-bg border-r border-sidebar-border z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-6 py-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-serif font-bold text-foreground leading-tight">
                WoodworkbyTanishas
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">{item.label}</p>
                  <p className={`text-xs mt-0.5 truncate ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                    {item.description}
                  </p>
                </div>
                {isActive && <ChevronRight size={14} className="text-primary-foreground/70 shrink-0" />}
              </button>
            );
          })}

          {/* Bulk Import */}
          <button
            onClick={() => {
              setActiveSection('bulk-import');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
              activeSection === 'bulk-import'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            <Upload size={18} className={activeSection === 'bulk-import' ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none">Bulk Import</p>
              <p className={`text-xs mt-0.5 truncate ${activeSection === 'bulk-import' ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                Import multiple products
              </p>
            </div>
            {activeSection === 'bulk-import' && <ChevronRight size={14} className="text-primary-foreground/70 shrink-0" />}
          </button>
        </nav>

        {/* Sidebar Footer - User Info */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">Administrator</p>
              <p className="text-xs text-muted-foreground truncate">{principalShort}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full gap-2 text-xs border-border/60 hover:border-destructive/40 hover:text-destructive"
          >
            <LogOut size={13} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-admin-bg/95 backdrop-blur-sm border-b border-border/50 px-4 sm:px-6 py-4 flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hidden sm:inline">Admin</span>
            <ChevronRight size={14} className="text-muted-foreground hidden sm:inline" />
            <span className="font-medium text-foreground capitalize">
              {activeSection === 'bulk-import' ? 'Bulk Import' : activeSection}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 px-3 py-1.5 rounded-full border border-border/40">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Admin Access
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
          {activeSection === 'dashboard' && <AdminDashboard />}
          {activeSection === 'products' && <AdminProductsSection />}
          {activeSection === 'categories' && <AdminCategoriesSection />}
          {activeSection === 'bulk-import' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Bulk Import</h2>
                <p className="text-sm text-muted-foreground mt-1">Import multiple products at once</p>
              </div>
              <BulkProductImport />
            </div>
          )}
          {activeSection === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Admin account and store settings</p>
              </div>

              {/* Account Info Card */}
              <div className="rounded-xl border border-border/50 bg-card p-6 max-w-lg">
                <h3 className="text-base font-semibold text-foreground mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <span className="text-sm font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                      Administrator
                    </span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-border/40">
                    <span className="text-sm text-muted-foreground">Principal ID</span>
                    <span className="text-xs font-mono text-foreground/80 max-w-[200px] break-all text-right">
                      {identity?.getPrincipal().toString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Access Level</span>
                    <div className="flex items-center gap-1.5 text-sm text-emerald-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Full Access
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Info Card */}
              <div className="rounded-xl border border-border/50 bg-card p-6 max-w-lg">
                <h3 className="text-base font-semibold text-foreground mb-4">Store Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-sm text-muted-foreground">Store Name</span>
                    <span className="text-sm font-medium text-foreground">WoodworkbyTanishas</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-sm text-muted-foreground">WhatsApp</span>
                    <span className="text-sm font-medium text-foreground">+91 9828288383</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Platform</span>
                    <span className="text-sm font-medium text-foreground">Internet Computer</span>
                  </div>
                </div>
              </div>

              <div className="max-w-lg">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                >
                  <LogOut size={15} />
                  Sign Out of Admin Panel
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
