import type { StickerRequestStatus } from "@/types/sticker";

interface StickerStatusBadgeProps {
  status: StickerRequestStatus;
  "data-testid"?: string;
}

type StatusBadgeConfig = {
  label: string;
  colorClass: string;
};

const statusConfig: Record<StickerRequestStatus, StatusBadgeConfig> = {
  pending: {
    label: "Pending",
    colorClass: "badge-warning",
  },
  requested: {
    label: "Requested",
    colorClass: "badge-info",
  },
  active: {
    label: "Active",
    colorClass: "badge-success",
  },
  inactive: {
    label: "Inactive",
    colorClass: "badge-error",
  },
};

export function StickerStatusBadge({
  status,
  "data-testid": dataTestId,
}: StickerStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`badge ${config.colorClass}`} data-testid={dataTestId}>
      {config.label}
    </span>
  );
}
