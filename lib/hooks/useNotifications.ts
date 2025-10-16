"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useNotificationsStore } from "@/store/notifications";
import { useAuthStore } from "@/store/auth";
import { useRealtime } from "./useRealtime";

/**
 * Hook for managing user notifications
 * Fetches notifications and subscribes to realtime updates
 */
export function useNotifications() {
  const supabase = createClient();
  const notificationsStore = useNotificationsStore();
  const { tenantUser } = useAuthStore();

  /**
   * Fetch initial notifications
   */
  const fetchNotifications = useCallback(async () => {
    if (!tenantUser?.id) return;

    try {
      notificationsStore.setLoading(true);
      notificationsStore.setError(null);

      const { data, error } = await supabase
        .from("notification")
        .select("*")
        .eq("user_id", tenantUser.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        const notifications = data.map((n) => ({
          id: n.id,
          tenantId: n.tenant_id,
          userId: n.user_id,
          type: n.type as
            | "guest_arrival"
            | "payment_due"
            | "sticker_expiring"
            | "announcement_new"
            | "incident_update"
            | "message_reply",
          priority: n.priority as "critical" | "high" | "normal" | "low",
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
        }));

        notificationsStore.setNotifications(notifications);
      }
    } catch (error) {
      notificationsStore.setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch notifications",
      );
    } finally {
      notificationsStore.setLoading(false);
    }
  }, [tenantUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Mark notification as read
   */
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notification")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;

      notificationsStore.markAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    if (!tenantUser?.id) return;

    try {
      const { error } = await supabase
        .from("notification")
        .update({ is_read: true })
        .eq("user_id", tenantUser.id)
        .eq("is_read", false);

      if (error) throw error;

      notificationsStore.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  /**
   * Delete notification
   */
  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notification")
        .delete()
        .eq("id", id);

      if (error) throw error;

      notificationsStore.removeNotification(id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    if (tenantUser?.id) {
      fetchNotifications();
    }
  }, [tenantUser?.id, fetchNotifications]);

  // Subscribe to realtime updates
  useRealtime({
    table: "notification",
    filter: tenantUser?.id ? `user_id=eq.${tenantUser.id}` : undefined,
    onInsert: (payload) => {
      const notification = payload.new as {
        id: string;
        tenant_id: string;
        user_id: string;
        type: string;
        priority: string;
        title: string;
        content: string;
        action_buttons: Array<{ label: string; action: string }> | null;
        related_entity_id: string | null;
        related_entity_type: string | null;
        is_read: boolean;
        created_at: string;
      };

      notificationsStore.addNotification({
        id: notification.id,
        tenantId: notification.tenant_id,
        userId: notification.user_id,
        type: notification.type as
          | "guest_arrival"
          | "payment_due"
          | "sticker_expiring"
          | "announcement_new"
          | "incident_update"
          | "message_reply",
        priority: notification.priority as
          | "critical"
          | "high"
          | "normal"
          | "low",
        title: notification.title,
        content: notification.content,
        actionButtons: notification.action_buttons,
        relatedEntityId: notification.related_entity_id,
        relatedEntityType: notification.related_entity_type,
        isRead: notification.is_read,
        createdAt: notification.created_at,
      });
    },
    onUpdate: (payload) => {
      const notification = payload.new as {
        id: string;
        is_read: boolean;
      };

      if (notification.is_read) {
        notificationsStore.markAsRead(notification.id);
      }
    },
    onDelete: (payload) => {
      const notification = payload.old as { id: string };
      notificationsStore.removeNotification(notification.id);
    },
  });

  return {
    notifications: notificationsStore.notifications,
    unreadCount: notificationsStore.unreadCount,
    isLoading: notificationsStore.isLoading,
    error: notificationsStore.error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
