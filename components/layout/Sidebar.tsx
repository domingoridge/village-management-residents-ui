"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Megaphone,
  CreditCard,
  Car,
  FileText,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUIStore } from "@/store/ui";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  permission?: "visiting_rights" | "signatory_rights";
}

export function Sidebar() {
  const pathname = usePathname();
  const { hasVisitingRights, hasSignatoryRights, signOut } = useAuth();
  const { isSidebarOpen } = useUIStore();

  const navItems: NavItem[] = [
    {
      href: ROUTES.DASHBOARD,
      label: "Dashboard",
      icon: Home,
    },
    {
      href: ROUTES.GUESTS.LIST,
      label: "Guests",
      icon: Users,
      // permission: 'visiting_rights',
    },
    {
      href: ROUTES.ANNOUNCEMENTS.LIST,
      label: "Announcements",
      icon: Megaphone,
    },
    {
      href: ROUTES.PAYMENTS.LIST,
      label: "Payments",
      icon: CreditCard,
    },
    {
      href: ROUTES.STICKERS.LIST,
      label: "Vehicle Stickers",
      icon: Car,
    },
    {
      href: ROUTES.PERMITS.LIST,
      label: "Permits",
      icon: FileText,
      permission: "signatory_rights",
    },
    {
      href: ROUTES.INCIDENTS.LIST,
      label: "Incidents",
      icon: AlertTriangle,
    },
    {
      href: ROUTES.MESSAGES.LIST,
      label: "Messages",
      icon: MessageSquare,
    },
    {
      href: ROUTES.RULES,
      label: "Rules",
      icon: BookOpen,
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.permission === "visiting_rights") {
      return hasVisitingRights;
    }
    if (item.permission === "signatory_rights") {
      return hasSignatoryRights;
    }
    return true;
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-neutral/20 bg-white transition-transform duration-300",
        "hidden md:block",
        !isSidebarOpen && "-translate-x-full",
      )}
    >
      <nav className="flex h-full flex-col p-4">
        <ul className="flex-1 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    "hover:bg-neutral/10",
                    isActive
                      ? "bg-primary-500 text-white hover:bg-primary-600"
                      : "text-neutral",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs font-semibold text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Bottom section */}
        <div className="space-y-1 border-t border-neutral/20 pt-4">
          <Link
            href={ROUTES.PROFILE.SETTINGS}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              "hover:bg-neutral/10",
              pathname === ROUTES.PROFILE.SETTINGS
                ? "bg-primary-500 text-white hover:bg-primary-600"
                : "text-neutral",
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span>Settings</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral transition-colors hover:bg-neutral/10"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
