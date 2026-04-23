import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const CAP_STEP = 500; // Cuando se llene, sube a 1000, 1500, etc.

function getCapForCount(count: number): number {
  return Math.ceil(Math.max(count, 1) / CAP_STEP) * CAP_STEP;
}

function parseWaitlistCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
  }

  return null;
}

export function useWaitlistCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const channelNameRef = useRef<string | null>(null);
  const channelName =
    channelNameRef.current ?? `waitlist-count-${Math.random().toString(36).slice(2)}`;
  channelNameRef.current = channelName;

  const fetchCount = useCallback(async () => {
    setLoading(true);

    try {
      // Camino principal: RPC pública segura que devuelve solo el total.
      const { data: publicCount, error: publicCountError } = await supabase.rpc(
        "get_public_waitlist_count" as never,
      );

      const parsedPublicCount = parseWaitlistCount(publicCount);

      if (!publicCountError && parsedPublicCount !== null) {
        setCount(parsedPublicCount);
        return;
      }

      if (publicCountError) {
        console.warn("Public waitlist count RPC error:", publicCountError.message);
      }

      // Fallback para sesiones privilegiadas (admin/service)
      const { count: total, error } = await supabase
        .from("waiting_list")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.warn("Waitlist count error (RLS?):", error.message);
        // Último fallback: select directo si la sesión tiene permiso SELECT.
        const { data, error: fallbackError } = await supabase
          .from("waiting_list")
          .select("id");

        if (!fallbackError && data) {
          setCount(data.length);
        } else {
          console.warn("Waitlist fallback also failed:", fallbackError?.message);
          setCount(0);
        }
      } else {
        setCount(total ?? 0);
      }
    } catch (err) {
      console.error("Waitlist count exception:", err);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    // Real-time: escuchar inserts en waiting_list
    // Cada instancia usa su propio canal para no reusar uno ya suscrito.
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "waiting_list" },
        () => {
          setCount((prev) => (prev !== null ? prev + 1 : prev));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchCount]);

  const cap = count !== null ? getCapForCount(count) : CAP_STEP;
  const remaining = count !== null ? cap - count : cap;
  const percentage = count !== null ? (count / cap) * 100 : 0;

  return {
    count,
    cap,
    remaining,
    percentage,
    loading,
    refresh: fetchCount,
  };
}
