import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AppSettings {
  discount_percentage: number;
  banner_interval: number;
  banner_text: string | null;
  is_banner_visible: boolean;
  recommended_pricing_plan_id: string | null;
  founders_seat_limit: number;
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: fetchedData, error } = await supabase
          .from("app_settings" as any)
          .select("discount_percentage, banner_interval, banner_text, is_banner_visible, recommended_pricing_plan_id, founders_seat_limit")
          .eq("id", 1)
          .maybeSingle(); // Use maybeSingle to avoid error on empty
        let data = fetchedData;

        if (!data) {
           console.log("No settings found, seeding defaults...");
           // Seed default settings
           const { data: newData, error: insertError } = await supabase
             .from("app_settings")
             .insert([{ id: 1, discount_percentage: 20, banner_interval: 5000, founders_seat_limit: 1000 }])
             .select()
             .single();
           
           if (!insertError && newData) {
             data = newData;
           }
        }

        if (error) throw error;

        // Cast data
        setSettings(data as unknown as AppSettings);
      } catch (err) {
        console.error("Error fetching app settings:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // Optional: Real-time subscription to updates
    const channel = supabase
      .channel("app_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "app_settings",
        },
        (payload) => {
            if (payload.eventType === 'DELETE') {
                setSettings(null);
            } else {
                setSettings(payload.new as AppSettings);
            }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { 
      discountPercentage: settings?.discount_percentage, 
      bannerInterval: settings?.banner_interval,
      bannerText: settings?.banner_text,
      isBannerVisible: settings?.is_banner_visible ?? true,
      recommendedPricingPlanId: settings?.recommended_pricing_plan_id ?? null,
      foundersSeatLimit: settings?.founders_seat_limit ?? 1000,
      loading, 
      error 
  };
};
