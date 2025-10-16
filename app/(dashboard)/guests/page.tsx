"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GuestCard } from "@/components/features/guests/GuestCard";
import { Pagination, PaginationInfo } from "@/components/ui/Pagination";
import { Skeleton, SkeletonList } from "@/components/ui/Skeleton";
import { fetchGuests } from "@/lib/api/guests";
import { useRealtime } from "@/lib/hooks/useRealtime";
import { useUIStore } from "@/store/ui";
import { ROUTES } from "@/constants/routes";
import type { Guest, GuestStatus } from "@/types";

export default function GuestsListPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<GuestStatus | "all">("all");
  const { addToast } = useUIStore();

  const pageSize = 10;

  // Load guests
  const loadGuests = async () => {
    try {
      setIsLoading(true);
      const result = await fetchGuests({
        page: currentPage,
        pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      setGuests(result.guests);
      setTotalPages(result.totalPages);
      setTotalCount(result.count);
    } catch (error) {
      addToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to load guests",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [currentPage, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime updates
  useRealtime({
    table: "guest",
    onInsert: () => {
      loadGuests();
    },
    onUpdate: () => {
      loadGuests();
    },
    onDelete: () => {
      loadGuests();
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: GuestStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral">
            Guest Pre-authorization
          </h1>
          <p className="text-neutral/70">
            Manage your guest access permissions
          </p>
        </div>
        <Link href={ROUTES.GUESTS.NEW}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Guest
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
          {(
            [
              "all",
              "pending",
              "approved",
              "at_gate",
              "completed",
              "denied",
            ] as const
          ).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "primary" : "outline"}
              size="sm"
              onClick={() => handleStatusFilterChange(status)}
            >
              {status === "all" ? "All" : status.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <SkeletonList items={5} />}

      {/* Empty State */}
      {!isLoading && guests.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-neutral/40 p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-neutral">
            No guests found
          </h3>
          <p className="mb-6 text-neutral/70">
            {statusFilter === "all"
              ? "You haven't pre-authorized any guests yet."
              : `No guests with status "${statusFilter.replace("_", " ")}".`}
          </p>
          <Link href={ROUTES.GUESTS.NEW}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Pre-authorize First Guest
            </Button>
          </Link>
        </div>
      )}

      {/* Guest List */}
      {!isLoading && guests.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {guests.map((guest) => (
              <GuestCard key={guest.id} guest={guest} />
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
