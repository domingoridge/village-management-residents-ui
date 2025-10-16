"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/browser";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

interface UseRealtimeOptions<T> {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  schema?: string;
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
}

/**
 * Hook for subscribing to Supabase Realtime changes
 * Automatically handles subscription lifecycle and cleanup
 */
export function useRealtime<T = Record<string, unknown>>(
  options: UseRealtimeOptions<T>,
) {
  const {
    table,
    event = "*",
    schema = "public",
    filter,
    onInsert,
    onUpdate,
    onDelete,
    onChange,
  } = options;

  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Create channel name
    const channelName = `realtime:${schema}:${table}${filter ? `:${filter}` : ""}`;

    // Create subscription
    const channel = supabase.channel(channelName);

    // Build changes configuration
    const changesConfig: {
      event: "*" | "INSERT" | "UPDATE" | "DELETE";
      schema: string;
      table: string;
      filter?: string;
    } = {
      event,
      schema,
      table,
    };

    if (filter) {
      changesConfig.filter = filter;
    }

    // Subscribe to postgres changes
    channel.on(
      "postgres_changes" as never,
      changesConfig as never,
      (payload: RealtimePostgresChangesPayload<T>) => {
        // Call the generic onChange handler
        onChange?.(payload);

        // Call specific event handlers
        if (payload.eventType === "INSERT") {
          onInsert?.(payload);
        } else if (payload.eventType === "UPDATE") {
          onUpdate?.(payload);
        } else if (payload.eventType === "DELETE") {
          onDelete?.(payload);
        }
      },
    );

    // Subscribe and store channel reference
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        // eslint-disable-next-line no-console
        console.log(`Subscribed to ${channelName}`);
      } else if (status === "CHANNEL_ERROR") {
        console.error(`Error subscribing to ${channelName}`);
      }
    });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, event, schema, filter, onInsert, onUpdate, onDelete, onChange]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    channel: channelRef.current,
  };
}
