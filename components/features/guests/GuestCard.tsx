import Link from "next/link";
import { Calendar, Clock, Car, Phone, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { GuestStatusBadge } from "./GuestStatusBadge";
import { formatDate, formatTime } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";
import type { Guest } from "@/types";

interface GuestCardProps {
  guest: Guest;
}

export function GuestCard({ guest }: GuestCardProps) {
  return (
    <Link href={ROUTES.GUESTS.DETAIL(guest.id)}>
      <Card className="transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{guest.guestName}</CardTitle>
              <p className="mt-1 text-sm text-neutral/70">{guest.purpose}</p>
            </div>
            <GuestStatusBadge status={guest.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Visit Date(s) */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-neutral/50" />
              <span className="text-neutral/70">
                {formatDate(guest.visitDateStart)}
                {guest.visitDateEnd &&
                  guest.visitDateEnd !== guest.visitDateStart && (
                    <> - {formatDate(guest.visitDateEnd)}</>
                  )}
                {guest.expectedArrivalTime && (
                  <>
                    {" "}
                    at{" "}
                    {formatTime(
                      new Date(`2000-01-01T${guest.expectedArrivalTime}`),
                    )}
                  </>
                )}
              </span>
            </div>

            {/* Phone */}
            {guest.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-neutral/50" />
                <span className="text-neutral/70">{guest.phone}</span>
              </div>
            )}

            {/* Vehicle Plate */}
            {guest.vehiclePlate && (
              <div className="flex items-center gap-2 text-sm">
                <Car className="h-4 w-4 text-neutral/50" />
                <span className="text-neutral/70">{guest.vehiclePlate}</span>
              </div>
            )}

            {/* Created At */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-neutral/50" />
              <span className="text-neutral/70">
                Pre-authorized {formatDate(guest.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
