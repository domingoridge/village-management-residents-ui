import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Loading state for dashboard routes
 * Shows skeleton UI while dashboard content loads
 */
export default function DashboardLoading() {
  return (
    <div
      className="min-h-screen bg-background"
      role="status"
      aria-label="Loading dashboard..."
    >
      {/* Header skeleton */}
      <div className="h-16 border-b border-base-300 bg-base-100">
        <div className="flex h-full items-center justify-between px-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Sidebar skeleton (desktop) */}
      <div className="hidden md:fixed md:left-0 md:top-16 md:flex md:h-[calc(100vh-4rem)] md:w-64 md:flex-col md:border-r md:border-base-300 md:bg-base-100 md:p-4">
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-4 h-10 w-full" />
      </div>

      {/* Main content skeleton */}
      <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-6">
        <Skeleton className="mb-6 h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="mt-6 h-64 w-full" />
      </main>
    </div>
  );
}
