import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDefaultVoice, sortVoices, type VoiceRecord } from '@/lib/voice-catalog';

interface UseVoicesOptions {
  includeInactive?: boolean;
  enabled?: boolean;
}

export function useVoices(options: UseVoicesOptions = {}) {
  const { includeInactive = false, enabled = true } = options;
  const [voices, setVoices] = useState<VoiceRecord[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchVoices = useCallback(async () => {
    if (!enabled) {
      setVoices([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const query = supabase
      .from('voices')
      .select('id, name, voice_id, provider, preview_url, is_active, is_default, created_at, updated_at');

    if (!includeInactive) {
      query.eq('is_active', true);
    }

    const { data, error: queryError } = await query
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });

    if (queryError) {
      setVoices([]);
      setError(queryError.message);
      setLoading(false);
      return;
    }

    setVoices(sortVoices((data ?? []) as VoiceRecord[]));
    setError(null);
    setLoading(false);
  }, [enabled, includeInactive]);

  useEffect(() => {
    void fetchVoices();
  }, [fetchVoices]);

  const defaultVoice = useMemo(() => getDefaultVoice(voices), [voices]);

  return {
    voices,
    defaultVoice,
    loading,
    error,
    refresh: fetchVoices,
  };
}
