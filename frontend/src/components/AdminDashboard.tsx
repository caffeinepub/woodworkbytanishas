import { Package, ToggleLeft, ToggleRight, LayoutGrid, MessageSquare, Mail, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useGetAnalyticsSummary } from '../hooks/useQueries';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { WoodType } from '../backend';

const CATEGORY_CONFIG = [
  { key: 'Mango Wood', woodType: WoodType.mangoWood, color: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-700', label: 'Mango Wood' },
  { key: 'Acacia Wood', woodType: WoodType.acaciaWood, color: 'bg-stone-50 border-stone-200', iconColor: 'text-stone-700', label: 'Acacia Wood' },
  { key: 'Line Range', woodType: WoodType.lineRange, color: 'bg-slate-50 border-slate-200', iconColor: 'text-slate-700', label: 'Line Range' },
  { key: 'Customised Products', woodType: WoodType.customisedProducts, color: 'bg-rose-50 border-rose-200', iconColor: 'text-rose-700', label: 'Customised Products' },
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  colorClass,
  iconColorClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  colorClass?: string;
  iconColorClass?: string;
}) {
  return (
    <div className={`rounded-xl border p-5 flex items-start gap-4 ${colorClass || 'bg-card border-border/50'}`}>
      <div className={`p-2.5 rounded-lg bg-white/60 shadow-xs ${iconColorClass || 'text-primary'}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 p-5 flex items-start gap-4 bg-card">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function woodTypeLabel(wt: WoodType): string {
  switch (wt) {
    case WoodType.mangoWood: return 'Mango Wood';
    case WoodType.acaciaWood: return 'Acacia Wood';
    case WoodType.lineRange: return 'Line Range';
    case WoodType.customisedProducts: return 'Customised Products';
    default: return wt;
  }
}

export default function AdminDashboard() {
  const { data: analytics, isLoading, error, refetch, isFetching } = useGetAnalyticsSummary();

  const categoryCountMap: Record<string, number> = {};
  if (analytics?.productsByCategory) {
    for (const [cat, prods] of analytics.productsByCategory) {
      categoryCountMap[cat] = prods.length;
    }
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">Live analytics for your WoodworkbyTanishas store</p>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col items-center gap-4 text-center max-w-md">
          <p className="text-sm font-medium text-destructive">Could not load dashboard data. Please try again.</p>
          <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">Live analytics for your WoodworkbyTanishas store</p>
        </div>
        {!isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 text-muted-foreground"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </Button>
        )}
      </div>

      {/* Primary Stats */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                icon={Package}
                label="Total Products"
                value={analytics ? Number(analytics.totalProducts) : 0}
                colorClass="bg-primary/5 border-primary/20"
                iconColorClass="text-primary"
              />
              <StatCard
                icon={ToggleRight}
                label="Active Products"
                value={analytics ? Number(analytics.activeProducts) : 0}
                sub="Visible to customers"
                colorClass="bg-emerald-50 border-emerald-200"
                iconColorClass="text-emerald-700"
              />
              <StatCard
                icon={ToggleLeft}
                label="Inactive Products"
                value={analytics ? Number(analytics.inactiveProducts) : 0}
                sub="Hidden from store"
                colorClass="bg-orange-50 border-orange-200"
                iconColorClass="text-orange-700"
              />
            </>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">By Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 p-4 bg-card">
                <Skeleton className="h-3 w-20 mb-3" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))
          ) : (
            CATEGORY_CONFIG.map((cat) => (
              <div key={cat.key} className={`rounded-xl border p-4 ${cat.color}`}>
                <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${cat.iconColor}`}>{cat.label}</p>
                <p className="text-3xl font-bold text-foreground">{categoryCountMap[cat.key] ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">products</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Enquiries Stats */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Enquiries</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                icon={MessageSquare}
                label="Customization Requests"
                value={analytics ? Number(analytics.totalCustomizationRequests) : 0}
                sub="Total received"
                colorClass="bg-violet-50 border-violet-200"
                iconColorClass="text-violet-700"
              />
              <StatCard
                icon={Mail}
                label="Contact Submissions"
                value={analytics ? Number(analytics.totalContactSubmissions) : 0}
                sub="Total received"
                colorClass="bg-sky-50 border-sky-200"
                iconColorClass="text-sky-700"
              />
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {!isLoading && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Customization Requests */}
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Recent Customization Requests</h3>
            </div>
            {analytics.recentCustomizationRequests.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No requests yet</div>
            ) : (
              <div className="divide-y divide-border/40">
                {analytics.recentCustomizationRequests.map((req) => (
                  <div key={req.id} className="px-5 py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare size={14} className="text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{req.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{req.productType} · {woodTypeLabel(req.woodType)}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatTimestamp(req.timestamp)}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Contact Submissions */}
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
              <LayoutGrid size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Recent Contact Submissions</h3>
            </div>
            {analytics.recentContactSubmissions.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No submissions yet</div>
            ) : (
              <div className="divide-y divide-border/40">
                {analytics.recentContactSubmissions.map((sub) => (
                  <div key={sub.id} className="px-5 py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail size={14} className="text-sky-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{sub.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{sub.message}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatTimestamp(sub.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
