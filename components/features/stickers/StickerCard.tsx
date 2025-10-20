import Link from "next/link";
import { Car, Tag, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StickerStatusBadge } from "./StickerStatusBadge";
import { formatDate } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";
import type { StickerRequest } from "@/types/sticker";

interface StickerCardProps {
  request: StickerRequest;
}

export function StickerCard({ request }: StickerCardProps) {
  const stickerTypeLabel =
    request.stickerType === "resident" ? "Resident" : "Beneficial User";

  return (
    <Link href={ROUTES.STICKERS.DETAIL(request.id)}>
      <Card
        className="transition-shadow hover:shadow-lg"
        data-testid="sticker-card"
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {request.vehiclePlateNumber}
              </CardTitle>
              <p className="mt-1 text-sm text-neutral/70">
                {request.vehicleMake} {request.vehicleModel}
              </p>
            </div>
            <StickerStatusBadge
              status={request.status}
              data-testid="sticker-status-badge"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Vehicle Details */}
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 text-neutral/50" />
              <span className="text-neutral/70">
                {request.vehicleColor && request.vehicleYear
                  ? `${request.vehicleYear} ${request.vehicleColor}`
                  : request.vehicleColor || request.vehicleYear || "Vehicle"}
              </span>
            </div>

            {/* Sticker Type */}
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-neutral/50" />
              <span className="text-neutral/70">{stickerTypeLabel}</span>
            </div>

            {/* Submitted Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-neutral/50" />
              <span className="text-neutral/70">
                Submitted {formatDate(request.submittedAt)}
              </span>
            </div>

            {/* Reviewed Date (if reviewed) */}
            {request.reviewedAt && (
              <div className="flex items-center gap-2 text-sm">
                {request.status === "approved" ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-error" />
                )}
                <span className="text-neutral/70">
                  Reviewed {formatDate(request.reviewedAt)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
