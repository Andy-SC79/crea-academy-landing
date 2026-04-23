import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  pollRouteMediaGenerationJob,
  requestRouteMediaGeneration,
} from '@/lib/route-media';
import { notifyMentorAboutContentGeneration } from '@/lib/content-generation-mentor-notifications';
import type {
  ContentGenerationAudience,
  ContentGenerationOutputType,
  ContentGenerationReferenceImage,
  ContentGenerationRequestResult,
  ContentGenerationResourceType,
  UserColorPalette,
} from '@/lib/content-generation-runtime';
import { labelForGeneratedContent } from '@/lib/content-generation-runtime';
import { useChatRuntimeStore } from '@/stores/useChatRuntimeStore';

type HandleSendFn = (
  content: string,
  options?: { silent?: boolean; skipUserMessage?: boolean },
) => void | Promise<void>;

type SubmitContentGenerationParams = {
  generationResult: ContentGenerationRequestResult;
  learningPathId: string;
  learningModuleId?: string | null;
  learningSectionId?: string | null;
  resourceType: ContentGenerationResourceType;
  resourceId: string;
  outputType: ContentGenerationOutputType;
  audience: ContentGenerationAudience;
  locale?: string;
  inputContext?: Record<string, unknown>;
  personalization?: Record<string, unknown>;
  visualPreferences?: Record<string, unknown>;
  ttsProvider?: 'google' | 'elevenlabs';
  voiceId?: string | null;
  voiceName?: string | null;
  referenceImage?: ContentGenerationReferenceImage | null;
  userColorPalette?: UserColorPalette | null;
  notifyMentor?: boolean;
  silent?: boolean;
};

type UseContentGenerationRuntimeOptions = {
  handleSend: HandleSendFn;
};

const POLL_INTERVAL_MS = 15_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useContentGenerationRuntime(options: UseContentGenerationRuntimeOptions) {
  const { handleSend } = options;
  const activeJobsById = useChatRuntimeStore((state) => state.activeJobsById);
  const requestGeneration = useChatRuntimeStore((state) => state.requestGeneration);
  const pollGeneration = useChatRuntimeStore((state) => state.pollGeneration);
  const markJobComplete = useChatRuntimeStore((state) => state.markJobComplete);
  const markJobFailed = useChatRuntimeStore((state) => state.markJobFailed);
  const bumpMediaRefresh = useChatRuntimeStore((state) => state.bumpMediaRefresh);
  const bumpAttachmentsRefresh = useChatRuntimeStore((state) => state.bumpAttachmentsRefresh);
  const activePollersRef = useRef<Set<string>>(new Set());

  const submitContentGenerationRequest = useCallback(async (params: SubmitContentGenerationParams) => {
    const {
      generationResult,
      learningPathId,
      learningModuleId,
      learningSectionId,
      resourceType,
      resourceId,
      outputType,
      audience,
      locale,
      inputContext,
      personalization,
      visualPreferences,
      ttsProvider,
      voiceId,
      voiceName,
      referenceImage,
      userColorPalette,
      notifyMentor,
      silent,
    } = params;

    const job = await requestRouteMediaGeneration({
      learningPathId,
      learningModuleId,
      learningSectionId,
      resourceType,
      resourceId,
      outputType,
      audience,
      locale,
      inputContext,
      personalization,
      visualPreferences,
      ttsProvider,
      voiceId,
      voiceName,
      referenceImage,
      userColorPalette,
    });

    requestGeneration({
      generationJobId: job.id,
      learningPathId,
      outputType,
      generationResult,
      notifyMentor,
      silent,
      providerJobId: job.providerJobId,
    });
    bumpMediaRefresh(learningPathId);
    bumpAttachmentsRefresh();
    if (silent !== true) {
      toast.success(`Solicitud de ${labelForGeneratedContent(outputType)} enviada.`);
    }

    await notifyMentorAboutContentGeneration(
      handleSend,
      generationResult,
      {
        approved: true,
        status: job.status || 'queued',
        generation_job_id: job.id,
        provider_job_id: job.providerJobId,
      },
      { notifyMentor },
    );
  }, [
    bumpAttachmentsRefresh,
    bumpMediaRefresh,
    handleSend,
    requestGeneration,
  ]);

  useEffect(() => {
    const jobs = Object.values(activeJobsById).filter((job) => job.status === 'queued' || job.status === 'polling');

    jobs.forEach((job) => {
      if (activePollersRef.current.has(job.generationJobId)) return;

      activePollersRef.current.add(job.generationJobId);

      void (async () => {
        try {
          for (let attempt = 0; attempt < job.maxAttempts; attempt += 1) {
            if (attempt > 0) {
              await sleep(POLL_INTERVAL_MS);
            }

            pollGeneration(job.generationJobId, {
              attempts: attempt + 1,
            });

            let polledJob;
            try {
              polledJob = await pollRouteMediaGenerationJob(job.generationJobId);
            } catch (error) {
              console.warn('[useContentGenerationRuntime] pollRouteMediaGenerationJob failed:', error);
              continue;
            }

            const status = (polledJob.status || '').toLowerCase();
            if (status === 'queued' || status === 'polling') {
              continue;
            }

            bumpMediaRefresh(job.learningPathId);
            bumpAttachmentsRefresh();

            if (status === 'completed') {
              markJobComplete(job.generationJobId, {
                attempts: attempt + 1,
                providerJobId: polledJob.providerJobId,
              });
              if (job.silent !== true) {
                toast.success(`${labelForGeneratedContent(job.outputType)} generado y guardado en tu repositorio.`);
              }
            } else {
              const failureMessage = polledJob.errorMessage || `No se pudo generar ${labelForGeneratedContent(job.outputType)}.`;
              markJobFailed(
                job.generationJobId,
                failureMessage,
                {
                  attempts: attempt + 1,
                  providerJobId: polledJob.providerJobId,
                },
                'failed',
              );
              if (job.silent !== true) {
                toast.error(failureMessage);
              }
            }

            await notifyMentorAboutContentGeneration(
              handleSend,
              job.generationResult,
              {
                approved: true,
                status,
                generation_job_id: polledJob.id,
                provider_job_id: polledJob.providerJobId,
                error: polledJob.errorMessage || undefined,
              },
              { notifyMentor: job.notifyMentor },
            );
            return;
          }

          const timeoutMessage = `La generacion de ${labelForGeneratedContent(job.outputType)} sigue en proceso. Intentalo de nuevo en unos minutos.`;
          markJobFailed(job.generationJobId, timeoutMessage, {
            attempts: job.maxAttempts,
          }, 'timed_out');
          if (job.silent !== true) {
            toast.error(timeoutMessage);
          }

          await notifyMentorAboutContentGeneration(
            handleSend,
            job.generationResult,
            {
              approved: true,
              status: 'failed',
              generation_job_id: job.generationJobId,
              error: timeoutMessage,
            },
            { notifyMentor: job.notifyMentor },
          );
        } finally {
          activePollersRef.current.delete(job.generationJobId);
        }
      })();
    });
  }, [
    activeJobsById,
    bumpAttachmentsRefresh,
    bumpMediaRefresh,
    handleSend,
    markJobComplete,
    markJobFailed,
    pollGeneration,
  ]);

  return {
    submitContentGenerationRequest,
  };
}
