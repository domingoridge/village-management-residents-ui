/**
 * Permits List Page
 *
 * Displays all permit applications (drafts and submitted) for the current user.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { usePermits } from "@/lib/hooks/usePermits";
import { useRealtime } from "@/lib/hooks/useRealtime";
import type { PermitStatus } from "@/types/permit";
import { Button } from "@/components/ui/Button";
import { Pagination, PaginationInfo } from "@/components/ui/Pagination";
import { Plus, FileText, Calendar, AlertCircle, Filter } from "lucide-react";
import { PERMIT_TYPES } from "@/constants/permitTypes";

export default function PermitsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PermitStatus | "all">("all");
  const queryClient = useQueryClient();

  const pageSize = 10;

  // Use TanStack Query hook for permits
  const { data, isLoading } = usePermits({
    page: currentPage,
    pageSize,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const applications = data?.permits || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.count || 0;

  // Realtime updates - invalidate queries on changes
  useRealtime({
    table: "permit",
    onInsert: () => {
      queryClient.invalidateQueries({ queryKey: ["permits"] });
    },
    onUpdate: () => {
      queryClient.invalidateQueries({ queryKey: ["permits"] });
    },
    onDelete: () => {
      queryClient.invalidateQueries({ queryKey: ["permits"] });
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: PermitStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-neutral/10 text-neutral";
      case "submitted":
        return "bg-primary-500/10 text-primary-500";
      case "under_review":
        return "bg-accent-500/10 text-accent-500";
      case "approved":
        return "bg-success-500/10 text-success-500";
      case "rejected":
        return "bg-error-500/10 text-error-500";
      case "pending_payment":
        return "bg-accent-500/10 text-accent-500";
      default:
        return "bg-neutral/10 text-neutral";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral">
            My Permit Applications
          </h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-neutral/10"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="permits-page">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral">
            My Permit Applications
          </h1>
          <p className="mt-1 text-neutral/70">
            View and manage your permit applications
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/permits/new")}
          data-testid="new-application-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral/50" />
          <span className="text-sm font-medium">Filter by status:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              "all",
              "draft",
              "submitted",
              "under_review",
              "approved",
              "rejected",
              "pending_payment",
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

      {/* Applications List */}
      {!isLoading && applications.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral/20 bg-neutral/5 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-neutral/30" />
          <h3 className="mt-4 text-lg font-semibold text-neutral">
            {statusFilter === "all"
              ? "No Applications Yet"
              : "No Matching Applications"}
          </h3>
          <p className="mt-1 text-sm text-neutral/70">
            {statusFilter === "all"
              ? "Get started by creating your first permit application"
              : `No permit applications with status "${statusFilter.replace("_", " ")}"`}
          </p>
          <Button
            variant="primary"
            onClick={() => router.push("/permits/new")}
            className="mt-4"
          >
            Create Application
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4" data-testid="applications-list">
            {applications.map((app) => {
              const permitMetadata = PERMIT_TYPES[app.permitType];
              const isDraft = app.status === "draft";

              return (
                <div
                  key={app.id}
                  className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm transition-all hover:border-primary-500/30 hover:shadow-md"
                  data-testid={`application-${app.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Application Info */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-neutral">
                          {permitMetadata.displayName}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(app.status)}`}
                          data-testid={`status-${app.id}`}
                        >
                          {app.status.replace("_", " ").toUpperCase()}
                        </span>
                        {isDraft && (
                          <span className="flex items-center gap-1 text-xs text-neutral/70">
                            <AlertCircle className="h-3 w-3" />
                            Draft
                          </span>
                        )}
                      </div>

                      <p className="mb-3 text-sm text-neutral/70">
                        {permitMetadata.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral/70">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Created:{" "}
                            {new Date(app.createdAt).toLocaleDateString(
                              "en-PH",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        {app.submittedAt && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>
                              Submitted:{" "}
                              {new Date(app.submittedAt).toLocaleDateString(
                                "en-PH",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {isDraft ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push(`/permits/${app.id}/edit`)}
                          data-testid={`resume-draft-${app.id}`}
                        >
                          Resume Draft
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/permits/${app.id}`)}
                          data-testid={`view-details-${app.id}`}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:justify-between">
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
          )}
        </>
      )}
    </div>
  );
}
