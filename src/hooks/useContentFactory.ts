import { useCallback, useEffect, useRef } from 'react';
import {
  buildLearningPathInfographicRequest,
  createContentFactoryGeneration,
  findInfographicPngUrl,
  getContentFactoryGeneration,
  toContentFactoryErrorMessage,
} from '@/lib/content-factory';
import type { EditableGeneratedPath, InfographicDraft } from '@/lib/global-template-ai';

const CONTENT_FACTORY_POLL_INTERVAL_MS = 15000;

type UpdateDraftFn = (
  generatedPathId: string,
  updater: (draft: InfographicDraft) => InfographicDraft,
) => void;

interface UseContentFactoryOptions {
  updateDraft: UpdateDraftFn;
}

export function useContentFactory({ updateDraft }: UseContentFactoryOptions) {
  const pollingIntervalsRef = useRef(new Map<string, number>());
  const activeRequestControllersRef = useRef(new Map<string, AbortController>());
  const activePollControllersRef = useRef(new Map<string, AbortController>());
  const inflightPollsRef = useRef(new Set<string>());

  const stopGeneration = useCallback((generatedPathId: string) => {
    const intervalId = pollingIntervalsRef.current.get(generatedPathId);
    if (typeof intervalId === 'number') {
      window.clearInterval(intervalId);
      pollingIntervalsRef.current.delete(generatedPathId);
    }

    const requestController = activeRequestControllersRef.current.get(generatedPathId);
    requestController?.abort();
    activeRequestControllersRef.current.delete(generatedPathId);

    const pollController = activePollControllersRef.current.get(generatedPathId);
    pollController?.abort();
    activePollControllersRef.current.delete(generatedPathId);

    inflightPollsRef.current.delete(generatedPathId);
  }, []);

  const clearAllGenerations = useCallback(() => {
    const pathIds = new Set<string>([
      ...pollingIntervalsRef.current.keys(),
      ...activeRequestControllersRef.current.keys(),
      ...activePollControllersRef.current.keys(),
    ]);

    pathIds.forEach((generatedPathId) => {
      stopGeneration(generatedPathId);
    });
  }, [stopGeneration]);

  useEffect(() => {
    return () => {
      clearAllGenerations();
    };
  }, [clearAllGenerations]);

  const pollGeneration = useCallback(async (params: {
    generatedPathId: string;
    jobId: string;
  }) => {
    if (inflightPollsRef.current.has(params.generatedPathId)) {
      return;
    }

    inflightPollsRef.current.add(params.generatedPathId);
    const pollController = new AbortController();
    activePollControllersRef.current.set(params.generatedPathId, pollController);

    try {
      const response = await getContentFactoryGeneration(params.jobId, {
        signal: pollController.signal,
      });
      const normalizedStatus = (response.status || '').trim().toLowerCase();

      if (normalizedStatus === 'completed') {
        stopGeneration(params.generatedPathId);
        const infographicUrl = findInfographicPngUrl(response);

        if (!infographicUrl) {
          throw new Error('La generacion finalizo, pero la API no devolvio infographic_png.');
        }

        updateDraft(params.generatedPathId, (draft) => ({
          ...draft,
          status: 'ready',
          previewUrl: infographicUrl,
          errorMessage: null,
          jobId: params.jobId,
          lastPolledAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        }));
        return;
      }

      if (normalizedStatus === 'failed') {
        stopGeneration(params.generatedPathId);
        updateDraft(params.generatedPathId, (draft) => ({
          ...draft,
          status: 'error',
          errorMessage: response.error?.trim() || response.message?.trim() || 'Content Factory no pudo generar la infografia.',
          lastPolledAt: new Date().toISOString(),
        }));
        return;
      }

      updateDraft(params.generatedPathId, (draft) => ({
        ...draft,
        status: 'polling',
        errorMessage: null,
        jobId: params.jobId,
        lastPolledAt: new Date().toISOString(),
      }));
    } catch (error) {
      if (pollController.signal.aborted) {
        return;
      }

      stopGeneration(params.generatedPathId);
      updateDraft(params.generatedPathId, (draft) => ({
        ...draft,
        status: 'error',
        errorMessage: toContentFactoryErrorMessage(error, 'No se pudo consultar el estado de la infografia.'),
      }));
    } finally {
      inflightPollsRef.current.delete(params.generatedPathId);
      if (activePollControllersRef.current.get(params.generatedPathId) === pollController) {
        activePollControllersRef.current.delete(params.generatedPathId);
      }
    }
  }, [stopGeneration, updateDraft]);

  const requestInfographic = useCallback(async (params: {
    path: EditableGeneratedPath;
    brandManualText?: string | null;
  }) => {
    stopGeneration(params.path.generatedPathId);

    const requestController = new AbortController();
    activeRequestControllersRef.current.set(params.path.generatedPathId, requestController);

    updateDraft(params.path.generatedPathId, (draft) => ({
      ...draft,
      status: 'requesting',
      errorMessage: null,
      jobId: null,
      lastRequestedAt: new Date().toISOString(),
    }));

    try {
      const response = await createContentFactoryGeneration(
        buildLearningPathInfographicRequest({
          path: params.path,
          brandManualText: params.brandManualText,
        }),
        {
          signal: requestController.signal,
        },
      );

      updateDraft(params.path.generatedPathId, (draft) => ({
        ...draft,
        status: 'polling',
        errorMessage: null,
        jobId: response.job_id,
      }));

      const intervalId = window.setInterval(() => {
        void pollGeneration({
          generatedPathId: params.path.generatedPathId,
          jobId: response.job_id,
        });
      }, CONTENT_FACTORY_POLL_INTERVAL_MS);

      pollingIntervalsRef.current.set(params.path.generatedPathId, intervalId);
    } catch (error) {
      if (requestController.signal.aborted) {
        return;
      }

      updateDraft(params.path.generatedPathId, (draft) => ({
        ...draft,
        status: 'error',
        errorMessage: toContentFactoryErrorMessage(error, 'No se pudo iniciar la generacion de la infografia.'),
        jobId: null,
      }));
    } finally {
      if (activeRequestControllersRef.current.get(params.path.generatedPathId) === requestController) {
        activeRequestControllersRef.current.delete(params.path.generatedPathId);
      }
    }
  }, [pollGeneration, stopGeneration, updateDraft]);

  return {
    requestInfographic,
    stopGeneration,
    clearAllGenerations,
  };
}
