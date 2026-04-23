import { useEffect, useMemo, useRef, useState } from 'react';
import type { MentorPersonality } from '@/stores/useAppStore';
import {
  buildAvatar3DPreviewCacheKey,
  isAvatar3DPreviewInFailureCooldown,
  isAvatar3DPreviewProvisionalSrc,
  isAvatar3DPreviewServiceInFailureCooldown,
  markAvatar3DPreviewFailure,
  markAvatar3DPreviewServiceFailure,
  readAvatar3DPreviewFromCache,
  writeAvatar3DPreviewToCache,
} from '@/lib/avatar3dPreviewCache';
import { invokeAvatar3DPreviewWithAuthRetry } from '@/lib/avatar3dPreviewApi';
import { buildAvatar3DRequest, buildAvatarPreviewConfig } from '@/lib/avatar-guide';

type UseAvatarGuidePreviewArgs = {
  mentorAvatar: string;
  mentorVoice: string;
  mentorPersonality: MentorPersonality;
  enabled?: boolean;
};

type UseAvatarGuidePreviewResult = {
  src: string | null;
  loading: boolean;
  error: string | null;
  requestKey: string;
};

// Share hot avatar previews between hook instances to avoid duplicate work in the same session.
const RUNTIME_PREVIEW_CACHE = new Map<string, string>();
const IN_FLIGHT_PREVIEW_REQUESTS = new Map<string, Promise<string | null>>();

function normalizeAvatar3DErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message.trim() : '';
  if (!raw) return 'Servicio de vista 3D no disponible por ahora.';

  const normalized = raw.toLowerCase();
  if (
    normalized.includes('non-2xx')
    || normalized.includes('failed to fetch')
    || normalized.includes('network')
    || normalized.includes('fetch')
    || normalized.includes('edge function')
  ) {
    return 'Servicio de vista 3D no disponible por ahora.';
  }

  if (normalized.includes('unauthorized')) {
    return 'Tu sesion expiro. Recarga la pagina e inicia sesion de nuevo.';
  }

  return raw;
}

export function useAvatarGuidePreview({
  mentorAvatar,
  mentorVoice,
  mentorPersonality,
  enabled = true,
}: UseAvatarGuidePreviewArgs): UseAvatarGuidePreviewResult {
  const cacheRef = useRef<Map<string, string>>(new Map());
  const [resolvedPreview, setResolvedPreview] = useState<{ key: string; src: string | null }>({
    key: '',
    src: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewConfig = useMemo(
    () => buildAvatarPreviewConfig(mentorVoice, mentorPersonality),
    [mentorPersonality, mentorVoice],
  );

  const request = useMemo(() => buildAvatar3DRequest(mentorAvatar, previewConfig), [mentorAvatar, previewConfig]);
  const requestKey = useMemo(() => buildAvatar3DPreviewCacheKey(request), [request]);
  const src = resolvedPreview.key === requestKey ? resolvedPreview.src : null;

  useEffect(() => {
    let cancelled = false;

    const setResolvedSrc = (nextSrc: string | null) => {
      setResolvedPreview({ key: requestKey, src: nextSrc });
    };

    if (!enabled) {
      setResolvedSrc(null);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    const cached = cacheRef.current.get(requestKey);
    if (cached) {
      setResolvedSrc(cached);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    const runtimeCached = RUNTIME_PREVIEW_CACHE.get(requestKey);
    if (runtimeCached) {
      cacheRef.current.set(requestKey, runtimeCached);
      setResolvedSrc(runtimeCached);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    const persisted = readAvatar3DPreviewFromCache(requestKey);
    if (persisted) {
      cacheRef.current.set(requestKey, persisted);
      RUNTIME_PREVIEW_CACHE.set(requestKey, persisted);
      setResolvedSrc(persisted);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    setResolvedSrc(null);

    if (isAvatar3DPreviewServiceInFailureCooldown() || isAvatar3DPreviewInFailureCooldown(requestKey)) {
      setLoading(false);
      setError('Servicio de vista 3D no disponible por ahora.');
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        let pendingRequest = IN_FLIGHT_PREVIEW_REQUESTS.get(requestKey);
        if (!pendingRequest) {
          pendingRequest = (async () => {
            try {
              const { data, error: requestError } = await invokeAvatar3DPreviewWithAuthRetry(request);
              if (requestError) {
                throw new Error(requestError.message || 'No se pudo generar el avatar 3D');
              }

              const response = (data ?? {}) as Record<string, unknown>;
              const isFallbackPreview = response.fallback === true;
              const imageBase64 = typeof response.imageBase64 === 'string' ? response.imageBase64 : '';
              const mimeType = typeof response.mimeType === 'string' ? response.mimeType : 'image/jpeg';

              if (isFallbackPreview || !imageBase64) {
                markAvatar3DPreviewServiceFailure();
                markAvatar3DPreviewFailure(requestKey);
                return null;
              }

              const nextSrc = `data:${mimeType};base64,${imageBase64}`;
              if (isAvatar3DPreviewProvisionalSrc(nextSrc)) {
                markAvatar3DPreviewServiceFailure();
                markAvatar3DPreviewFailure(requestKey);
                return null;
              }

              return nextSrc;
            } catch (requestFetchError) {
              markAvatar3DPreviewServiceFailure();
              markAvatar3DPreviewFailure(requestKey);
              throw requestFetchError;
            } finally {
              IN_FLIGHT_PREVIEW_REQUESTS.delete(requestKey);
            }
          })();
          IN_FLIGHT_PREVIEW_REQUESTS.set(requestKey, pendingRequest);
        }

        const resolvedSrc = await pendingRequest;
        if (cancelled) return;

        if (!resolvedSrc) {
          setResolvedSrc(null);
          setError('Servicio de vista 3D no disponible por ahora.');
          return;
        }

        cacheRef.current.set(requestKey, resolvedSrc);
        RUNTIME_PREVIEW_CACHE.set(requestKey, resolvedSrc);
        writeAvatar3DPreviewToCache(requestKey, resolvedSrc);
        setResolvedSrc(resolvedSrc);
        setError(null);
      } catch (fetchError) {
        if (!cancelled) {
          setResolvedSrc(null);
          setError(normalizeAvatar3DErrorMessage(fetchError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 100);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [enabled, request, request.character, requestKey]);

  return {
    src,
    loading,
    error,
    requestKey,
  };
}
