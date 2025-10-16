"use client";

import { Bell, Menu, User } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { formatInitials } from "@/lib/utils/formatters";

export function Header() {
  const { userProfile, fullName } = useAuth();
  const { unreadCount } = useNotifications();
  const { toggleSidebar, toggleMobileMenu } = useUIStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral/20 bg-white px-4 shadow-sm md:px-6">
      {/* Left: Menu button (mobile) and Logo/Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMobileMenu}
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="hidden md:flex"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="text-lg font-semibold text-primary-500 md:text-xl">
          Village Portal
        </h1>
      </div>

      {/* Right: Notifications and Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 p-0"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {/* User profile */}
        <div className="flex items-center gap-2">
          <div className="hidden flex-col items-end md:flex">
            <span className="text-sm font-medium text-neutral">{fullName}</span>
            <span className="text-xs text-neutral/70">Resident</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={fullName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span>{formatInitials(fullName || "User")}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
