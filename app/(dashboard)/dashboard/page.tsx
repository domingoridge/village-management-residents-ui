"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const { fullName, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral">
          Welcome back, {fullName}!
        </h1>
        <p className="text-neutral/70">
          Here&apos;s what&apos;s happening in your village today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your household overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral/70">
              Dashboard widgets will be implemented in subsequent phases.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral/70">
              Activity feed coming soon.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Important alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral/70">No new notifications.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
