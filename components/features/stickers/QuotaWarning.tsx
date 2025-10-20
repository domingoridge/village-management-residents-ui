"use client";

import { Info } from "lucide-react";

interface QuotaWarningProps {
  used: number;
  total: number;
  currentVehicles: number;
}

export function QuotaWarning({
  used,
  total,
  currentVehicles,
}: QuotaWarningProps) {
  const remaining = total - used;
  const percentUsed = (used / total) * 100;

  return (
    <div className="alert alert-info mb-6" role="alert">
      <div className="flex items-start gap-3">
        <Info
          className="h-5 w-5 text-primary flex-shrink-0"
          aria-hidden="true"
        />
        <div className="flex-1">
          <h3 className="font-semibold">
            Sticker Quota: {used} of {total} used
          </h3>
          <p className="mt-1 text-sm">
            You have {remaining} sticker{remaining !== 1 ? "s" : ""} remaining.
            You are currently requesting {currentVehicles} vehicle
            {currentVehicles > 1 ? "s" : ""}.
          </p>
          <div className="mt-2">
            <div className="h-2 w-full rounded-full bg-base-300">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
                role="progressbar"
                aria-valuenow={used}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={`${used} of ${total} stickers used`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
