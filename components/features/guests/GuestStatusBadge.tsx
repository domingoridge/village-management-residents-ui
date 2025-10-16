import { cn } from "@/lib/utils/cn";
import type { GuestStatus } from "@/types";

interface GuestStatusBadgeProps {
  status: GuestStatus;
  className?: string;
}

const statusConfig: Record<
  GuestStatus,
  {
    label: string;
    color: string;
  }
> = {
  pending: {
    label: "Pending",
    color: "bg-info-500 text-white",
  },
  approved: {
    label: "Approved",
    color: "bg-success-500 text-white",
  },
  at_gate: {
    label: "At Gate",
    color: "bg-accent-500 text-white",
  },
  denied: {
    label: "Denied",
    color: "bg-error-500 text-white",
  },
  completed: {
    label: "Completed",
    color: "bg-neutral/20 text-neutral",
  },
};

export function GuestStatusBadge({ status, className }: GuestStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
