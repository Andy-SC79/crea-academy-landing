import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformPricing {
  id: number;
  route_creation_cost: number;
  general_chat_cost: number;
  live_minute_cost: number;
  media_generation_cost: number;
  updated_at: string;
}

const PLATFORM_PRICING_MISSING_TABLE_MESSAGE = "La tabla public.platform_pricing no existe en el proyecto Supabase conectado. Aplica la migracion 20260414120000_platform_pricing_dynamic_ai_credits.sql.";

type SupabaseLikeError = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  hint?: unknown;
};

function isMissingPlatformPricingTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as SupabaseLikeError;
  const code = typeof record.code === "string" ? record.code : "";
  const message = typeof record.message === "string" ? record.message : "";
  return code === "PGRST205" || message.includes("Could not find the table 'public.platform_pricing'");
}

export const usePlatformPricing = () => {
  const [pricing, setPricing] = useState<PlatformPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("platform_pricing")
          .select("id, route_creation_cost, general_chat_cost, live_minute_cost, media_generation_cost, updated_at")
          .eq("id", 1)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setError(null);
        setPricing(data as PlatformPricing | null);
      } catch (err) {
        if (isMissingPlatformPricingTable(err)) {
          console.warn("platform_pricing table is missing in the connected Supabase project.");
          setError(new Error(PLATFORM_PRICING_MISSING_TABLE_MESSAGE));
        } else {
          console.error("Error fetching platform pricing:", err);
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
        setPricing(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchPricing();

    const channel = supabase
      .channel("platform_pricing_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "platform_pricing",
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setPricing(null);
            return;
          }

          setPricing(payload.new as PlatformPricing);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return {
    pricing,
    loading,
    error,
  };
};
