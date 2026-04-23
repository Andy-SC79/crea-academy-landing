import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAudioSamplePlayer } from '@/hooks/useAudioSamplePlayer';
import { getFunctionInvokeErrorMessage } from '@/lib/backend-capabilities';
import { normalizeVoiceProvider, type TtsProvider } from '@/lib/voice-catalog';

type VoicePreviewParams = {
  voiceId: string;
  provider?: TtsProvider | string | null;
  voiceName?: string | null;
  previewUrl?: string | null;
  language?: 'es' | 'en' | 'pt';
  text?: string;
  preferGenerated?: boolean;
};

const rawVoicePreviewFlag = (import.meta.env.VITE_ENABLE_VOICE_PREVIEWS || '').trim().toLowerCase();
const VOICE_PREVIEW_ENABLED = rawVoicePreviewFlag !== 'false';

function normalizePreviewUrl(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isLikelyDirectAudioPreviewUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    if (hostname === 'elevenlabs.io' || hostname === 'www.elevenlabs.io') {
      return false;
    }

    if (hostname === 'api.elevenlabs.io' && pathname.includes('/voices/') && pathname.endsWith('/preview')) {
      return true;
    }

    if (/\.(mp3|wav|ogg|m4a|aac|webm)(\?|$)/i.test(`${pathname}${parsed.search}`)) {
      return true;
    }

    return hostname.includes('cdn') || hostname.includes('storage') || hostname.includes('cloudfront');
  } catch {
    return false;
  }
}

const generatedPreviewCache = new Map<string, string>();
const generatedPreviewRequests = new Map<string, Promise<string | null>>();

async function getFunctionAuthHeaders(): Promise<Record<string, string> | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  const accessToken = data.session?.access_token?.trim();
  if (!accessToken) {
    return null;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function resolveSampleText(
  language: 'es' | 'en' | 'pt',
  text?: string,
  voiceName?: string | null,
): string {
  const safeVoiceName = typeof voiceName === 'string' ? voiceName.trim() : '';
  return text?.trim()
    || (language === 'en'
      ? `Hi, I am ${safeVoiceName || 'your mentor'}. I will guide your learning journey in Crea.`
      : language === 'pt'
        ? `Ola, eu sou ${safeVoiceName || 'seu mentor'}. Vou acompanhar seu aprendizado na Crea.`
        : `Hola, soy ${safeVoiceName || 'tu mentor'}. Voy a acompanarte en tu aprendizaje en Crea.`);
}

function buildGeneratedPreviewCacheKey(voiceId: string, language: 'es' | 'en' | 'pt', text: string): string {
  return [
    voiceId.trim().toLowerCase(),
    language,
    text.trim().toLowerCase(),
  ].join('::');
}

function getGeneratedPreviewDataUriFromCache(
  voiceId: string,
  provider: TtsProvider,
  language: 'es' | 'en' | 'pt',
  text: string,
): string | null {
  const cacheKey = buildGeneratedPreviewCacheKey(`${provider}:${voiceId}`, language, text);
  return generatedPreviewCache.get(cacheKey) ?? null;
}

async function getGeneratedPreviewDataUri(
  voiceId: string,
  provider: TtsProvider,
  language: 'es' | 'en' | 'pt',
  text: string,
): Promise<string | null> {
  const cacheKey = buildGeneratedPreviewCacheKey(`${provider}:${voiceId}`, language, text);
  const cached = generatedPreviewCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = generatedPreviewRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const request = (async () => {
    const authHeaders = await getFunctionAuthHeaders();

    const { data, error } = await supabase.functions.invoke('elevenlabs-greeting-tts', {
      headers: authHeaders ?? undefined,
      body: {
        text,
        voice: voiceId,
        tts_provider: provider,
        language,
      },
    });

    if (error) {
      const message = await getFunctionInvokeErrorMessage(
        error,
        data,
        'No se pudo generar la muestra de voz.',
      );
      throw new Error(message);
    }

    const payload = (data ?? {}) as Record<string, unknown>;
    const audioBase64 = typeof payload.audioBase64 === 'string' ? payload.audioBase64.trim() : '';
    const mimeType = typeof payload.mimeType === 'string' && payload.mimeType.trim()
      ? payload.mimeType
      : 'audio/mpeg';

    if (!audioBase64) {
      return null;
    }

    const dataUri = `data:${mimeType};base64,${audioBase64}`;
    generatedPreviewCache.set(cacheKey, dataUri);
    return dataUri;
  })()
    .finally(() => {
      generatedPreviewRequests.delete(cacheKey);
    });

  generatedPreviewRequests.set(cacheKey, request);
  return request;
}

export function useVoicePreviewPlayer() {
  const { play, playDataUri, stop, playingId } = useAudioSamplePlayer();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const primePreview = useCallback(async ({
    voiceId,
    provider,
    voiceName,
    previewUrl,
    language = 'es',
    text,
    preferGenerated = false,
  }: VoicePreviewParams) => {
    if (!VOICE_PREVIEW_ENABLED) {
      return false;
    }

    const normalizedPreviewUrl = normalizePreviewUrl(previewUrl);
    if (!preferGenerated && isLikelyDirectAudioPreviewUrl(normalizedPreviewUrl)) {
      return true;
    }

    try {
      const resolvedProvider = normalizeVoiceProvider(provider);
      const sampleText = resolveSampleText(language, text, voiceName);
      const dataUri = await getGeneratedPreviewDataUri(voiceId, resolvedProvider, language, sampleText);
      return Boolean(dataUri);
    } catch (error) {
      console.warn('[useVoicePreviewPlayer] Prime preview failed', error);
      return false;
    }
  }, []);

  const playPreview = useCallback(async ({
    voiceId,
    provider,
    voiceName,
    previewUrl,
    language = 'es',
    text,
    preferGenerated = false,
  }: VoicePreviewParams) => {
    if (!VOICE_PREVIEW_ENABLED) {
      stop();
      return false;
    }

    setLoadingId(voiceId);
    try {
      const normalizedPreviewUrl = normalizePreviewUrl(previewUrl);
      if (!preferGenerated && normalizedPreviewUrl) {
        const playedRemoteSample = await play(voiceId, normalizedPreviewUrl);
        if (playedRemoteSample) {
          return true;
        }
      }

      try {
        const resolvedProvider = normalizeVoiceProvider(provider);
        const sampleText = resolveSampleText(language, text, voiceName);
        const cachedDataUri = getGeneratedPreviewDataUriFromCache(
          voiceId,
          resolvedProvider,
          language,
          sampleText,
        );
        if (cachedDataUri) {
          return playDataUri(voiceId, cachedDataUri);
        }

        const dataUri = await getGeneratedPreviewDataUri(voiceId, resolvedProvider, language, sampleText);
        if (!dataUri) {
          toast.error('No se pudo generar la muestra de voz.');
          return false;
        }

        const played = await playDataUri(voiceId, dataUri);
        if (!played) {
          toast.message('La muestra está lista. Presiona "Escuchar" de nuevo.');
        }
        return played;
      } catch (error) {
        console.warn('[useVoicePreviewPlayer] Generated preview failed', error);
        toast.error(error instanceof Error ? error.message : 'No se pudo reproducir la muestra de voz.');
        return false;
      }
    } finally {
      setLoadingId((current) => (current === voiceId ? null : current));
    }
  }, [play, playDataUri, stop]);

  return {
    playPreview,
    primePreview,
    stop,
    playingId,
    loadingId,
    previewEnabled: VOICE_PREVIEW_ENABLED,
  };
}
