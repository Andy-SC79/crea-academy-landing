import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { A2UIDirective } from '@/components/its/a2ui-protocol';
import {
  buildRoutePlannerResultKey,
  extractRoutePlanningStateFromDirective,
  normalizeRoutePlanningState,
  normalizeRouteQuestionBlockPayload,
  validateRoutePlannerDirective,
  type RoutePlanningState,
} from '@/lib/route-planner-contract';
import type { ChatMessage } from '@/stores/useAppStore';

type DoneMetaLike = {
  route_planning_state?: string;
  route_planning_error?: string;
};

function isActivePlannerPlanMessage(message: ChatMessage): boolean {
  return message.componentResolved !== true && message.embeddedComponent?.type === 'its_route_blueprint';
}

function isActivePlannerQuestionMessage(message: ChatMessage): boolean {
  if (message.componentResolved === true || message.embeddedComponent?.type !== 'its_route_question_block') {
    return false;
  }
  const props = normalizeRouteQuestionBlockPayload(message.embeddedComponent.props, { legacy: true });
  if (!props || props.read_only === true) return false;
  return props.prompts.some((prompt) => {
    const answerText = typeof prompt.submitted_answer_text === 'string' ? prompt.submitted_answer_text.trim() : '';
    const answerId = typeof prompt.submitted_answer_id === 'string' ? prompt.submitted_answer_id.trim() : '';
    return !answerText && !answerId;
  });
}

function readRoutePlanningStateFromMessage(message: ChatMessage): RoutePlanningState | null {
  const metadataState = normalizeRoutePlanningState(message.metadata?.route_planning_state);
  if (metadataState) return metadataState;
  if (!message.embeddedComponent) return null;
  return extractRoutePlanningStateFromDirective(
    message.embeddedComponent.type,
    message.embeddedComponent.props,
  );
}

function findLatestByPredicate(
  chatHistory: ChatMessage[],
  predicate: (message: ChatMessage) => boolean,
): ChatMessage | null {
  for (let index = chatHistory.length - 1; index >= 0; index -= 1) {
    const candidate = chatHistory[index];
    if (candidate && predicate(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function useRoutePlannerController(params: {
  isRoutePlanningThread: boolean;
  chatHistory: ChatMessage[];
}) {
  const { isRoutePlanningThread, chatHistory } = params;
  const [plannerState, setPlannerState] = useState<RoutePlanningState | null>(null);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const processedPlannerResultKeysRef = useRef<Set<string>>(new Set());

  const latestPlanMessage = useMemo(
    () => isRoutePlanningThread
      ? findLatestByPredicate(chatHistory, isActivePlannerPlanMessage)
      : null,
    [chatHistory, isRoutePlanningThread],
  );

  const latestQuestionMessage = useMemo(
    () => isRoutePlanningThread
      ? findLatestByPredicate(chatHistory, isActivePlannerQuestionMessage)
      : null,
    [chatHistory, isRoutePlanningThread],
  );

  useEffect(() => {
    if (!isRoutePlanningThread) {
      setPlannerState(null);
      setPlannerError(null);
      processedPlannerResultKeysRef.current.clear();
      return;
    }

    if (latestPlanMessage) {
      setPlannerState('await_feedback');
      setPlannerError(null);
      return;
    }

    let nextState: RoutePlanningState | null = null;
    let nextError: string | null = null;
    for (let index = chatHistory.length - 1; index >= 0; index -= 1) {
      const candidate = chatHistory[index];
      if (!candidate) continue;

      const candidateState = readRoutePlanningStateFromMessage(candidate);
      if (candidateState) {
        nextState = candidateState;
        break;
      }

      if (candidate.metadata?.route_planning_error && typeof candidate.metadata.route_planning_error === 'string') {
        nextError = candidate.metadata.route_planning_error;
        break;
      }
    }
    setPlannerState(nextState);
    setPlannerError(nextError);
  }, [chatHistory, isRoutePlanningThread, latestPlanMessage]);

  const validateLiveDirective = useCallback((directive: A2UIDirective) => {
    if (!isRoutePlanningThread) {
      return {
        ok: true as const,
        directive,
      };
    }

    if (directive.type !== 'its_route_question_block' && directive.type !== 'its_route_blueprint') {
      return {
        ok: true as const,
        directive,
      };
    }

    const validation = validateRoutePlannerDirective(directive.type, directive.props);
    if (validation.ok === false) {
      return {
        ok: false as const,
        error: validation.error,
        issues: validation.issues,
      };
    }

    return {
      ok: true as const,
      directive: {
        ...directive,
        props: validation.props,
      },
    };
  }, [isRoutePlanningThread]);

  const applyDoneMeta = useCallback((meta: DoneMetaLike | null | undefined) => {
    if (!meta) return;
    const nextState = normalizeRoutePlanningState(meta.route_planning_state);
    if (nextState) {
      setPlannerState(nextState);
    }
    if (typeof meta.route_planning_error === 'string' && meta.route_planning_error.trim()) {
      setPlannerError(meta.route_planning_error.trim());
    } else {
      setPlannerError(null);
    }
  }, []);

  const markToolResultProcessed = useCallback((result: Record<string, unknown>) => {
    const key = buildRoutePlannerResultKey(result);
    if (!key) return;
    processedPlannerResultKeysRef.current.add(key);
  }, []);

  const hasProcessedToolResult = useCallback((result: Record<string, unknown>) => {
    const key = buildRoutePlannerResultKey(result);
    return key ? processedPlannerResultKeysRef.current.has(key) : false;
  }, []);

  const resetPlannerController = useCallback(() => {
    setPlannerState(null);
    setPlannerError(null);
    processedPlannerResultKeysRef.current.clear();
  }, []);

  return {
    plannerState,
    plannerError,
    latestPlanMessage,
    latestQuestionMessage,
    applyDoneMeta,
    setPlannerState,
    setPlannerError,
    validateLiveDirective,
    markToolResultProcessed,
    hasProcessedToolResult,
    resetPlannerController,
  };
}
