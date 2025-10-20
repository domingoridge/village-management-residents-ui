"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Filter } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { StickerCard } from "@/components/features/stickers/StickerCard";
import { Pagination, PaginationInfo } from "@/components/ui/Pagination";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useStickerRequests } from "@/lib/hooks/useStickers";
import { useRealtime } from "@/lib/hooks/useRealtime";
import { useAuthStore } from "@/store/auth";
import { ROUTES } from "@/constants/routes";
import type { StickerRequestStatus } from "@/types/sticker";

export default function StickersListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    StickerRequestStatus | "all"
  >("all");
  const queryClient = useQueryClient();
  const { resident } = useAuthStore();

  const pageSize = 10;

  // Use TanStack Query hook for sticker requests
  const { data, isLoading } = useStickerRequests({
    householdId: resident?.householdId,
    status: statusFilter === "all" ? undefined : statusFilter,
    page: currentPage,
    pageSize,
  });

  const requests = data?.requests || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.count || 0;

  // Realtime updates - invalidate queries instead of manual refetch
  useRealtime({
    table: "vehicle_sticker",
    onInsert: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers"] });
    },
    onUpdate: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers"] });
    },
    onDelete: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers"] });
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: StickerRequestStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral">
            Vehicle Sticker Requests
          </h1>
          <p className="text-neutral/70">
            Manage your vehicle sticker applications
          </p>
        </div>
        <Link href={ROUTES.STICKERS.NEW}>
          <Button data-testid="request-new-sticker-button">
            <Plus className="mr-2 h-4 w-4" />
            Request New Sticker
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral/50" />
          <span className="text-sm font-medium">Filter by status:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "active", "inactive", "requested"] as const).map(
            (status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "primary" : "outline"}
                size="sm"
                onClick={() => handleStatusFilterChange(status)}
                data-testid={`filter-${status}`}
              >
                {status === "all" ? "All" : status.replace("_", " ")}
              </Button>
            ),
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <SkeletonList items={5} />}

      {/* Empty State */}
      {!isLoading && requests.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-neutral/40 p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-neutral">
            No sticker requests found
          </h3>
          <p className="mb-6 text-neutral/70">
            {statusFilter === "all"
              ? "You haven't requested any vehicle stickers yet."
              : `No requests with status "${statusFilter}".`}
          </p>
          <Link href={ROUTES.STICKERS.NEW}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request First Sticker
            </Button>
          </Link>
        </div>
      )}

      {/* Sticker Request List */}
      {!isLoading && requests.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <StickerCard key={request.id} request={request} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <PaginationInfo
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalCount}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
