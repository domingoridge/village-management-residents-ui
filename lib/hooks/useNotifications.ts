"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/browser";
import { useAuthStore } from "@/store/auth";
import { useRealtime } from "./useRealtime";

type NotificationType =
  | "guest_arrival"
  | "payment_due"
  | "sticker_expiring"
  | "announcement_new"
  | "incident_update"
  | "message_reply";

type NotificationPriority = "critical" | "high" | "normal" | "low";

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  content: string;
  actionButtons: Array<{ label: string; action: string }> | null;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  isRead: boolean;
  createdAt: string;
}

/**
 * Query key factory for notifications
 */
const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (userId?: string) => [...notificationKeys.lists(), userId] as const,
};

/**
 * Hook for managing user notifications
 * Uses TanStack Query for data fetching and caching
 */
export function useNotifications() {
  const { tenantUser } = useAuthStore();
  const queryClient = useQueryClient();

  /**
   * Fetch notifications query
   */
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: notificationKeys.list(tenantUser?.id),
    queryFn: async () => {
      if (!tenantUser?.id) return [];

      const supabase = createClient();
      const { data, error } = await supabase
        .from("notification")
        .select("*")
        .eq("user_id", tenantUser.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return data.map((n) => ({
        id: n.id,
        tenantId: n.tenant_id,
        userId: n.user_id,
        type: n.type as NotificationType,
        priority: n.priority as NotificationPriority,
        title: n.title,
        content: n.content,
        actionButtons: n.action_buttons as Array<{
          label: string;
          action: string;
        }> | null,
        relatedEntityId: n.related_entity_id,
        relatedEntityType: n.related_entity_type,
        isRead: n.is_read,
        createdAt: n.created_at,
      })) as Notification[];
    },
    enabled: !!tenantUser?.id,
  });

  /**
   * Mark notification as read mutation
   */
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("notification")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(tenantUser?.id),
      });
    },
    onError: (error) => {
      console.error("Failed to mark notification as read:", error);
    },
  });

  /**
   * Mark all notifications as read mutation
   */
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!tenantUser?.id) return;

      const supabase = createClient();
      const { error } = await supabase
        .from("notification")
        .update({ is_read: true })
        .eq("user_id", tenantUser.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(tenantUser?.id),
      });
    },
    onError: (error) => {
      console.error("Failed to mark all notifications as read:", error);
    },
  });

  /**
   * Delete notification mutation
   */
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("notification")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(tenantUser?.id),
      });
    },
    onError: (error) => {
      console.error("Failed to delete notification:", error);
    },
  });

  // Subscribe to realtime updates
  useRealtime({
    table: "notification",
    filter: tenantUser?.id ? `user_id=eq.${tenantUser.id}` : undefined,
    onInsert: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(tenantUser?.id),
      });
    },
    onUpdate: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(tenantUser?.id),
      });
    },
    onDelete: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(tenantUser?.id),
      });
    },
  });

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error: error as Error | null,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    refetch,
  };
}
