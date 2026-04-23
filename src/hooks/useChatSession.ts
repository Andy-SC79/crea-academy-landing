/**
 * useChatSession - persistent learning thread management.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabase } from '@/integrations/supabase/client';
import { useAppStore, type ChatMessage, type ThreadAssistantSkill } from '@/stores/useAppStore';
import type { MentorTurnOrigin } from '@/stores/useChatRuntimeStore';
import { parseSSEChunk, type A2UIDirective, type SourceReference, type StreamDoneMeta } from '@/components/its/a2ui-protocol';
import type { SliceUpVisualInput } from '@/lib/sliceup-multimodal';
import { sanitizeMojibakeText } from '@/utils/chatContentSanitizer';

const isLocalDevBrowser = import.meta.env.DEV
  && typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const LOCAL_MENTOR_CHAT_URL = import.meta.env.VITE_LOCAL_MENTOR_CHAT_URL?.trim() || '';
const MENTOR_CHAT_BASE_URL = (
  isLocalDevBrowser && LOCAL_MENTOR_CHAT_URL
    ? LOCAL_MENTOR_CHAT_URL
    : SUPABASE_URL
)?.replace(/\/+$/, '');

type GoalHorizon = '7d' | '30d' | '90d' | 'custom';
type ThreadStatus = 'active' | 'paused' | 'completed';
type LearningContextType = 'personal' | 'organization';

interface CreateThreadInput {
  learningGoal: string;
  goalApplication: string;
  goalHorizon: GoalHorizon;
  focusInstruction?: string;
  assistantSkillContext?: Record<string, unknown>;
  learningPathId?: string;
  learningModuleId?: string;
  learningSectionId?: string;
  contextType?: LearningContextType;
  contextOrgId?: string | null;
  skipLimitCheck?: boolean;
}
interface StreamMessageOptions {
  onComponent?: (directive: A2UIDirective) => void;
  onComponentStart?: (componentType: string, seedProps?: Record<string, unknown>) => void;
  onComponentPatch?: (componentType: string, partialPropsText: string) => void;
  onComponentCommit?: (directive: A2UIDirective) => void;
  onComponentError?: (componentType: string, reason: string) => void;
  onDoneMeta?: (meta: StreamDoneMeta) => void;
  skipUserPersist?: boolean;
  internalContext?: string;
  enabledPlugins?: string[];
  assistantSkill?: ThreadAssistantSkill;
  assistantSkillContext?: Record<string, unknown>;
  visualInput?: SliceUpVisualInput;
  visualInputs?: SliceUpVisualInput[];
  clientRequestId?: string;
  turnOrigin?: MentorTurnOrigin;
}

interface FetchThreadsOptions {
  hydrateMessages?: boolean;
}

interface UseChatSessionOptions {
  bootstrapMode?: 'default' | 'path' | 'new';
  preferredPathId?: string | null;
}

interface ThreadRow {
  id: string;
  title: string | null;
  thread_status: ThreadStatus;
  context_type?: LearningContextType | null;
  context_org_id?: string | null;
  learning_goal: string | null;
  goal_application: string | null;
  goal_horizon: GoalHorizon | null;
  focus_instruction: string | null;
  learning_path_id: string | null;
  learning_module_id: string | null;
  learning_section_id: string | null;
  last_message_at: string;
  started_at: string;
  agent_mode: string | null;
  last_agent_mode: string | null;
  message_count: number;
  web_grounding_enabled: boolean | null;
  requires_freshness: boolean | null;
  is_global: boolean | null;
  thread_type: string | null;
  assistant_skill?: string | null;
  assistant_skill_context?: Record<string, unknown> | null;
}

type MentorChatErrorPayload = {
  code?: string | number | null;
  message?: string | null;
  error?: string | null;
  details?: string | null;
};

const CHAT_SESSION_SELECT_WITH_CONTEXT_BASE = 'id, title, thread_status, context_type, context_org_id, learning_goal, goal_application, goal_horizon, focus_instruction, learning_path_id, learning_module_id, learning_section_id, last_message_at, started_at, agent_mode, last_agent_mode, message_count, web_grounding_enabled, requires_freshness, is_global, thread_type';
const CHAT_SESSION_SELECT_WITH_CONTEXT = `${CHAT_SESSION_SELECT_WITH_CONTEXT_BASE}, assistant_skill, assistant_skill_context`;
const CHAT_SESSION_SELECT_LEGACY = 'id, title, thread_status, learning_goal, goal_application, goal_horizon, focus_instruction, learning_path_id, learning_module_id, learning_section_id, last_message_at, started_at, agent_mode, last_agent_mode, message_count, web_grounding_enabled, requires_freshness, is_global, thread_type';

type SupabaseQueryError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
} | null;

function isMissingColumnError(error: SupabaseQueryError, columns: string[]): boolean {
  if (!error) return false;

  const code = typeof error.code === 'string' ? error.code : '';
  const message = typeof error.message === 'string' ? error.message : '';
  const details = typeof error.details === 'string' ? error.details : '';
  const hint = typeof error.hint === 'string' ? error.hint : '';
  const combined = `${message} ${details} ${hint}`.toLowerCase();

  const referencesAnyColumn = columns.some((column) => combined.includes(column.toLowerCase()));
  if (!referencesAnyColumn) return false;

  if (code === '42703' || code === 'PGRST204') return true;
  return combined.includes('does not exist') || combined.includes('no existe');
}

function isHiddenSystemTrigger(
  role: string | null | undefined,
  content: string | null | undefined,
  metadata: unknown,
): boolean {
  if (role !== 'user') return false;
  const text = typeof content === 'string' ? content.trim() : '';
  if (text.startsWith('[SYSTEM:')) return true;
  if (text.startsWith('[A2UI Tool Result]')) return true;
  if (text.startsWith('[PERSONALIZED_GREETING_REQUEST]')) return true;
  if (text.includes('[CONTEXT:')) return true;
  if (!metadata || typeof metadata !== 'object') return false;
  const record = metadata as Record<string, unknown>;
  return record.is_hidden_trigger === true || record.is_tool_result === true;
}

function stripEmojiChars(value: string): string {
  try {
    return value.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').replace(/\s+/g, ' ').trim();
  } catch {
    return value.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim();
  }
}

function stripMarkdownArtifacts(value: string): string {
  return value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/[_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeComparableText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9?¿\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function parseMentorChatErrorPayload(response: Response): Promise<MentorChatErrorPayload> {
  try {
    const data = await response.json();
    if (!data || typeof data !== 'object') return {};
    return data as MentorChatErrorPayload;
  } catch {
    return {};
  }
}

function isMentorChatAuthRetryable(
  response: Response,
  payload: MentorChatErrorPayload | null | undefined,
): boolean {
  if (response.status !== 400 && response.status !== 401 && response.status !== 403) return false;

  const combined = [
    typeof payload?.code === 'string' || typeof payload?.code === 'number' ? String(payload.code) : '',
    typeof payload?.message === 'string' ? payload.message : '',
    typeof payload?.error === 'string' ? payload.error : '',
    typeof payload?.details === 'string' ? payload.details : '',
  ]
    .join(' ')
    .toLowerCase();

  return combined.includes('invalid jwt')
    || combined.includes('jwt')
    || combined.includes('token')
    || combined.includes('unauthorized')
    || combined.includes('authorization');
}

function dedupeRepeatedGreeting(value: string): string {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (!compact) return compact;

  const sentenceParts = compact.split(/(?<=[?.!])\s+/).filter(Boolean);
  if (sentenceParts.length > 1) {
    const uniqueParts: string[] = [];
    for (const part of sentenceParts) {
      const normalized = normalizeComparableText(part);
      const last = uniqueParts.length > 0
        ? normalizeComparableText(uniqueParts[uniqueParts.length - 1] || '')
        : '';
      if (normalized && normalized === last) continue;
      uniqueParts.push(part);
    }
    return uniqueParts.join(' ').trim();
  }

  const words = compact.split(' ').filter(Boolean);
  if (words.length >= 6 && words.length % 2 === 0) {
    const half = words.length / 2;
    const firstHalf = words.slice(0, half).join(' ');
    const secondHalf = words.slice(half).join(' ');
    if (normalizeComparableText(firstHalf) === normalizeComparableText(secondHalf)) {
      return firstHalf.trim();
    }
  }

  return compact;
}

function clampWords(value: string, maxWords: number): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value.trim();
  return words.slice(0, maxWords).join(' ').trim();
}

function normalizeGreetingFromHistory(content: string): string {
  let text = stripEmojiChars(content || '');
  text = stripMarkdownArtifacts(text);
  text = dedupeRepeatedGreeting(text);
  text = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  text = text.replace(/[.!]+$/g, '').trim();
  text = clampWords(text, 14);
  if (text.includes('?')) {
    text = text.slice(0, text.indexOf('?') + 1).trim();
  } else {
    text = `${clampWords(text, 11)} ¿seguimos?`.trim();
  }
  text = dedupeRepeatedGreeting(text);
  return text.replace(/\s+/g, ' ').trim();
}

function isProactiveGreetingRecord(
  role: string | null | undefined,
  content: string | null | undefined,
  metadata: unknown,
  hasVisibleUserMessages: boolean,
): boolean {
  if (role !== 'agent' || typeof content !== 'string') return false;
  if (!metadata || typeof metadata !== 'object') {
    return !hasVisibleUserMessages && content.length > 120;
  }
  const record = metadata as Record<string, unknown>;
  return record.proactive_greeting === true
    || record.greeting_fast_path === true
    || record.model === 'a2ui_quick_greeting'
    || (!hasVisibleUserMessages && content.length > 120);
}

function dedupeInitialProactiveGreetingRows<T extends {
  role: string | null | undefined;
  content: string | null | undefined;
  metadata?: unknown;
}>(messages: T[], hasVisibleUserMessages: boolean): T[] {
  const deduped: T[] = [];
  let beforeFirstVisibleUserMessage = true;
  let lastGreetingSignature: string | null = null;

  for (const message of messages) {
    if (!beforeFirstVisibleUserMessage) {
      deduped.push(message);
      continue;
    }

    if (message.role === 'user') {
      beforeFirstVisibleUserMessage = false;
      lastGreetingSignature = null;
      deduped.push(message);
      continue;
    }

    if (message.role !== 'agent') {
      lastGreetingSignature = null;
      deduped.push(message);
      continue;
    }

    const rawContent = typeof message.content === 'string' ? sanitizeMojibakeText(message.content) : '';
    if (!isProactiveGreetingRecord(message.role, rawContent, message.metadata, hasVisibleUserMessages)) {
      lastGreetingSignature = null;
      deduped.push(message);
      continue;
    }

    const greetingSignature = normalizeGreetingFromHistory(rawContent);
    if (greetingSignature && greetingSignature === lastGreetingSignature) {
      continue;
    }

    lastGreetingSignature = greetingSignature || null;
    deduped.push(message);
  }

  return deduped;
}

function normalizeText(value: string | null | undefined, maxLen: number): string | null {
  if (!value) return null;
  const cleaned = sanitizeMojibakeText(value).trim().replace(/\s+/g, ' ');
  if (!cleaned) return null;
  return cleaned.slice(0, maxLen);
}

function sanitizeDirectiveValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return sanitizeMojibakeText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDirectiveValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, sanitizeDirectiveValue(nestedValue)]),
    );
  }

  return value;
}

function normalizeDirectivePayload(raw: unknown): A2UIDirective | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  if (record.directive && typeof record.directive === 'object' && !Array.isArray(record.directive)) {
    return normalizeDirectivePayload(record.directive);
  }
  if (record.component && typeof record.component === 'object' && !Array.isArray(record.component)) {
    return normalizeDirectivePayload(record.component);
  }
  const typeCandidate = typeof record.type === 'string'
    ? record.type
    : (typeof record.name === 'string' ? record.name : '');
  const propsCandidate = (
    record.props && typeof record.props === 'object' && !Array.isArray(record.props)
      ? record.props
      : (record.args && typeof record.args === 'object' && !Array.isArray(record.args)
        ? record.args
        : null)
  ) as Record<string, unknown> | null;

  if (!typeCandidate || !propsCandidate) return null;
  const sanitizedPropsCandidate = sanitizeDirectiveValue(propsCandidate) as Record<string, unknown>;

  if (typeCandidate.startsWith('its_')) {
    if (typeCandidate === 'its_markdown_plan') {
      return {
        type: 'its_route_blueprint',
        props: {
          ...sanitizedPropsCandidate,
          summary_md: typeof sanitizedPropsCandidate.summary_md === 'string' && sanitizedPropsCandidate.summary_md.trim()
            ? sanitizedPropsCandidate.summary_md
            : (typeof sanitizedPropsCandidate.content === 'string' ? sanitizedPropsCandidate.content : undefined),
          footer: sanitizedPropsCandidate.footer && typeof sanitizedPropsCandidate.footer === 'object' && !Array.isArray(sanitizedPropsCandidate.footer)
            ? sanitizedPropsCandidate.footer
            : {
              feedback_placeholder: '¿Quieres cambiar algo? Ej: Hazlo más enfocado en práctica...',
              approve_label: '🚀 Implementar Ruta de Aprendizaje',
            },
        },
        text_before: typeof record.text_before === 'string' ? sanitizeMojibakeText(record.text_before) : undefined,
        text_after: typeof record.text_after === 'string' ? sanitizeMojibakeText(record.text_after) : undefined,
      };
    }

    return {
      type: typeCandidate,
      props: sanitizedPropsCandidate,
      text_before: typeof record.text_before === 'string' ? sanitizeMojibakeText(record.text_before) : undefined,
      text_after: typeof record.text_after === 'string' ? sanitizeMojibakeText(record.text_after) : undefined,
    };
  }

  if (typeCandidate === 'ask_multiple_choice') {
    return { type: 'its_question_prompt', props: sanitizedPropsCandidate };
  }

  if (typeCandidate === 'ask_route_question_block') {
    return { type: 'its_route_question_block', props: sanitizedPropsCandidate };
  }

  if (typeCandidate === 'propose_learning_plan') {
    return { type: 'its_route_blueprint', props: sanitizedPropsCandidate };
  }

  return null;
}

function extractPersistedDirectives(metadata: unknown): A2UIDirective[] {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return [];
  const record = metadata as Record<string, unknown>;
  const directiveCandidates: unknown[] = [];
  if (Array.isArray(record.a2ui_directives)) directiveCandidates.push(...record.a2ui_directives);
  if (Array.isArray(record.a2ui_components)) directiveCandidates.push(...record.a2ui_components);
  if (record.a2ui_directive) directiveCandidates.push(record.a2ui_directive);
  if (record.directive) directiveCandidates.push(record.directive);
  if (record.component) directiveCandidates.push(record.component);

  if (directiveCandidates.length === 0) {
    const normalizedSelf = normalizeDirectivePayload(record);
    return normalizedSelf ? [normalizedSelf] : [];
  }

  const seen = new Set<string>();
  return directiveCandidates.flatMap((candidate) => {
    const normalized = normalizeDirectivePayload(candidate);
    if (!normalized) return [];
    const fingerprint = `${normalized.type}:${JSON.stringify(normalized.props)}`;
    if (seen.has(fingerprint)) return [];
    seen.add(fingerprint);
    return [normalized];
  });
}

function extractPersistedSources(metadata: unknown): SourceReference[] {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return [];
  const record = metadata as Record<string, unknown>;
  if (!Array.isArray(record.sources)) return [];

  return record.sources.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return [];
    const source = candidate as Record<string, unknown>;
    const url = typeof source.url === 'string' ? source.url.trim() : '';
    const objectPath = typeof source.object_path === 'string' ? source.object_path.trim() : '';
    const assetId = typeof source.asset_id === 'string' ? source.asset_id.trim() : '';
    const sourceId = typeof source.source_id === 'string' ? source.source_id.trim() : '';
    const referenceKind = source.reference_kind === 'web'
      || source.reference_kind === 'route_media'
      || source.reference_kind === 'memory'
      || source.reference_kind === 'session_summary'
      || source.reference_kind === 'academy_template'
      || source.reference_kind === 'other'
      ? source.reference_kind
      : null;
    const researchStage = source.research_stage === 'internal_rag'
      || source.research_stage === 'academy_admin'
      || source.research_stage === 'web_official'
      || source.research_stage === 'other'
      ? source.research_stage
      : null;
    if (!url && !objectPath && !assetId && !sourceId && !referenceKind) return [];
    return [{
      title: typeof source.title === 'string' ? source.title : null,
      url: url || null,
      domain: typeof source.domain === 'string' ? source.domain : null,
      published_at: typeof source.published_at === 'string' ? source.published_at : null,
      retrieved_at: typeof source.retrieved_at === 'string' ? source.retrieved_at : null,
      snippet: typeof source.snippet === 'string' ? source.snippet : null,
      source_type: typeof source.source_type === 'string' ? source.source_type : null,
      source_tier: source.source_tier === 'official'
        || source.source_tier === 'changelog'
        || source.source_tier === 'primary'
        || source.source_tier === 'market'
        || source.source_tier === 'other'
        ? source.source_tier
        : null,
      reference_kind: referenceKind,
      research_stage: researchStage,
      asset_id: assetId || null,
      bucket_id: typeof source.bucket_id === 'string' ? source.bucket_id : null,
      object_path: objectPath || null,
      file_name: typeof source.file_name === 'string' ? source.file_name : null,
      mime_type: typeof source.mime_type === 'string' ? source.mime_type : null,
      source_id: sourceId || null,
      chunk_id: typeof source.chunk_id === 'string' ? source.chunk_id : null,
      page_number: typeof source.page_number === 'number' ? source.page_number : null,
      start_time: typeof source.start_time === 'number' ? source.start_time : null,
      end_time: typeof source.end_time === 'number' ? source.end_time : null,
      scene_index: typeof source.scene_index === 'number' ? source.scene_index : null,
      score: typeof source.score === 'number' ? source.score : null,
      metadata_json: source.metadata_json && typeof source.metadata_json === 'object' && !Array.isArray(source.metadata_json)
        ? source.metadata_json as Record<string, unknown>
        : null,
    }];
  });
}

export function useChatSession(userId: string | undefined, options?: UseChatSessionOptions) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const activeStreamAbortRef = useRef<AbortController | null>(null);
  const activeStreamRunIdRef = useRef(0);
  const bootstrappedUserRef = useRef<string | null>(null);
  const assistantSkillColumnsAvailableRef = useRef<boolean | null>(null);
  const bootstrapMode = options?.bootstrapMode || 'default';
  const preferredPathId = normalizeText(options?.preferredPathId, 100);

  const agentMode = useAppStore((s) => s.agentMode);
  const currentCourseId = useAppStore((s) => s.currentCourseId);
  const activeThreadId = useAppStore((s) => s.activeThreadId);
  const activePathId = useAppStore((s) => s.activePathId);
  const activeLearningSectionId = useAppStore((s) => s.activeLearningSectionId);
  const threads = useAppStore((s) => s.threads);
  const setActiveThreadInStore = useAppStore((s) => s.setActiveThread);
  const setActivePathInStore = useAppStore((s) => s.setActivePath);
  const setActiveLearningSectionInStore = useAppStore((s) => s.setActiveLearningSection);
  const enterWorld = useAppStore((s) => s.enterWorld);
  const exitWorld = useAppStore((s) => s.exitWorld);
  const refreshThreadsInStore = useAppStore((s) => s.refreshThreads);
  const updateThreadStatusInStore = useAppStore((s) => s.updateThreadStatus);
  const updateThreadGoalInStore = useAppStore((s) => s.updateThreadGoal);

  const hydrateThreadMessages = useCallback(async (targetThreadId: string) => {
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at, metadata')
      .eq('session_id', targetThreadId)
      .order('created_at', { ascending: true })
      .limit(1000);

    const visibleMsgs = (msgs || []).filter((m) =>
      !isHiddenSystemTrigger(m.role, m.content, (m as { metadata?: unknown }).metadata),
    );
    const hasVisibleUserMessages = visibleMsgs.some((m) => m.role === 'user');
    const dedupedVisibleMsgs = dedupeInitialProactiveGreetingRows(
      visibleMsgs,
      hasVisibleUserMessages,
    );
    const chatMsgs: ChatMessage[] = dedupedVisibleMsgs.flatMap((m) => {
      const metadata = (m as { metadata?: unknown }).metadata;
      const persistedDirectives = extractPersistedDirectives(metadata);
      const persistedSources = extractPersistedSources(metadata);
      const metadataRecord = metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? metadata as Record<string, unknown>
        : null;
      const rawContent = typeof m.content === 'string' ? sanitizeMojibakeText(m.content) : '';
      const content = isProactiveGreetingRecord(m.role, rawContent, metadata, hasVisibleUserMessages)
        ? normalizeGreetingFromHistory(rawContent)
        : rawContent;
      const timestamp = new Date(m.created_at).getTime();
      const plannerState = typeof metadataRecord?.route_planning_state === 'string'
        ? metadataRecord.route_planning_state
        : undefined;

      if (persistedDirectives.length === 0) {
        const embeddedComponent = m.role === 'agent' && persistedSources.length > 0
          ? {
            type: 'its_sources_block',
            props: {
              sources: persistedSources,
              sources_count: persistedSources.length,
              web_grounding_used: metadataRecord?.web_grounding_used === true,
              summary: typeof metadataRecord?.research_summary === 'string' ? metadataRecord.research_summary : undefined,
              read_only: true,
            },
          }
          : undefined;

        return [{
          id: m.id,
          role: m.role as 'user' | 'agent' | 'system',
          content,
          timestamp,
          metadata: metadataRecord || undefined,
          embeddedComponent,
        }];
      }

      const hydratedMessages: ChatMessage[] = [];
      const hasRouteBlueprint = persistedDirectives.some((directive) =>
        directive.type === 'its_markdown_plan' || directive.type === 'its_route_blueprint',
      );
      const hasVisibleText = content.trim().length > 0 && !hasRouteBlueprint;
      if (hasVisibleText) {
        hydratedMessages.push({
          id: m.id,
          role: m.role as 'user' | 'agent' | 'system',
          content,
          timestamp,
          metadata: metadataRecord || undefined,
        });
      }

      hydratedMessages.push(...persistedDirectives.map((directive, index) => ({
        id: `${m.id}::a2ui::${index + 1}`,
        role: m.role as 'user' | 'agent' | 'system',
        content: hasVisibleText ? '' : (typeof directive.text_before === 'string' ? directive.text_before : ''),
        timestamp: timestamp + index + (hasVisibleText ? 1 : 0),
        metadata: metadataRecord || undefined,
        embeddedComponent: {
          type: directive.type,
          props: {
            ...directive.props,
            ...(plannerState && (
              directive.type === 'its_route_question_block'
              || directive.type === 'its_route_blueprint'
            ) ? { route_planning_state: plannerState } : {}),
            ...((directive.type === 'its_markdown_plan' || directive.type === 'its_route_blueprint') && persistedSources.length > 0
              ? {
                sources: persistedSources,
                research_summary: typeof metadataRecord?.research_summary === 'string'
                  ? metadataRecord.research_summary
                  : directive.props?.research_summary,
              }
              : {}),
            read_only: true,
          },
        },
      })));

      if (
        persistedSources.length > 0
        && !persistedDirectives.some((directive) =>
          directive.type === 'its_markdown_plan' || directive.type === 'its_route_blueprint',
        )
      ) {
        hydratedMessages.push({
          id: `${m.id}::sources`,
          role: 'agent',
          content: '',
          timestamp: timestamp + persistedDirectives.length + (hasVisibleText ? 1 : 0),
          metadata: metadataRecord || undefined,
          embeddedComponent: {
            type: 'its_sources_block',
            props: {
              sources: persistedSources,
              sources_count: persistedSources.length,
              web_grounding_used: metadataRecord?.web_grounding_used === true,
              summary: typeof metadataRecord?.research_summary === 'string' ? metadataRecord.research_summary : undefined,
              read_only: true,
            },
          },
        });
      }

      return hydratedMessages;
    });

    const store = useAppStore.getState();
    store.clearChatHistory();
    chatMsgs.forEach((msg) => store.addChatMessage(msg));
  }, []);

  const fetchThreads = useCallback(async (
    preferredThreadId?: string | null,
    options?: FetchThreadsOptions,
  ) => {
    if (!userId) return null;

    let rawThreads: ThreadRow[] | null = null;
    let threadQueryError: SupabaseQueryError = null;

    const selectClause = assistantSkillColumnsAvailableRef.current === false
      ? CHAT_SESSION_SELECT_WITH_CONTEXT_BASE
      : CHAT_SESSION_SELECT_WITH_CONTEXT;

    const primaryResponse = await supabase
      .from('chat_sessions')
      .select(selectClause)
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(200);

    rawThreads = (primaryResponse.data || null) as ThreadRow[] | null;
    threadQueryError = primaryResponse.error;

    if (
      threadQueryError
      && assistantSkillColumnsAvailableRef.current !== false
      && isMissingColumnError(threadQueryError, ['assistant_skill', 'assistant_skill_context'])
    ) {
      assistantSkillColumnsAvailableRef.current = false;
      const fallbackResponse = await supabase
        .from('chat_sessions')
        .select(CHAT_SESSION_SELECT_WITH_CONTEXT_BASE)
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false })
        .limit(200);
      rawThreads = (fallbackResponse.data || null) as ThreadRow[] | null;
      threadQueryError = fallbackResponse.error;
    }

    if (threadQueryError && isMissingColumnError(threadQueryError, ['context_type', 'context_org_id'])) {
      assistantSkillColumnsAvailableRef.current = !isMissingColumnError(threadQueryError, ['assistant_skill', 'assistant_skill_context']);
      const fallbackResponse = await supabase
        .from('chat_sessions')
        .select(CHAT_SESSION_SELECT_LEGACY)
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false })
        .limit(200);
      rawThreads = (fallbackResponse.data || null) as ThreadRow[] | null;
      threadQueryError = fallbackResponse.error;
    } else if (!threadQueryError) {
      assistantSkillColumnsAvailableRef.current = true;
    }

    if (threadQueryError) {
      console.error('[useChatSession] fetchThreads query error:', threadQueryError);
    }

    const mapped = ((rawThreads || []) as ThreadRow[])
      .map((row) => ({
        id: row.id,
        title: row.title || 'Nueva ruta de aprendizaje',
        thread_status: row.thread_status || 'active',
        context_type: row.context_type || 'personal',
        context_org_id: row.context_org_id,
        learning_goal: row.learning_goal,
        goal_application: row.goal_application,
        goal_horizon: row.goal_horizon || '30d',
        focus_instruction: row.focus_instruction,
        learning_path_id: row.learning_path_id,
        learning_module_id: row.learning_module_id,
        learning_section_id: row.learning_section_id,
        last_message_at: row.last_message_at,
        started_at: row.started_at,
        agent_mode: row.agent_mode,
        last_agent_mode: row.last_agent_mode,
        message_count: row.message_count || 0,
        web_grounding_enabled: row.web_grounding_enabled ?? true,
        requires_freshness: row.requires_freshness ?? false,
        is_global: row.is_global ?? true,
        thread_type: row.thread_type || 'legacy',
        assistant_skill: row.assistant_skill === 'news' ? 'news' : 'default',
        assistant_skill_context: row.assistant_skill_context && typeof row.assistant_skill_context === 'object'
          ? row.assistant_skill_context
          : {},
      }))
      .filter((thread) => thread.thread_type === 'learning_goal' || thread.thread_type === 'learning_section');

    refreshThreadsInStore(mapped);

    const routeScopedThreads = bootstrapMode === 'path' && preferredPathId
      ? mapped.filter((thread) => thread.learning_path_id === preferredPathId)
      : mapped;

    const preferred = preferredThreadId
      ? mapped.find((thread) => (
        thread.id === preferredThreadId
        && (bootstrapMode !== 'path' || !preferredPathId || thread.learning_path_id === preferredPathId)
      ))
      : null;

    // When a preferredThreadId was explicitly requested but not found in results
    // (e.g. just-inserted thread not yet visible), do NOT fall back to old thread.
    // Just keep the current store state and skip hydration to prevent context mixing.
    if (preferredThreadId && !preferred) {
      console.warn('[useChatSession] preferredThread not found in query results - skipping fallback to avoid context mixing');
      if (bootstrapMode === 'path' && preferredPathId) {
        setThreadId(null);
        setActiveThreadInStore(null);
        setActivePathInStore(preferredPathId);
        setActiveLearningSectionInStore(null);
        useAppStore.getState().clearChatHistory();
        return null;
      }
      return preferredThreadId;
    }

    const currentActiveThreadId = useAppStore.getState().activeThreadId;
    const currentActive = currentActiveThreadId
      ? mapped.find((thread) => (
        thread.id === currentActiveThreadId
        && (bootstrapMode !== 'path' || !preferredPathId || thread.learning_path_id === preferredPathId)
      ))
      : null;
    const currentActiveRunnable = currentActive?.thread_status === 'active'
      ? currentActive
      : null;
    const latestActive = routeScopedThreads.find((thread) => thread.thread_status === 'active');
    const fallback = routeScopedThreads[0] || null;
    const selected = preferred || currentActiveRunnable || latestActive || currentActive || fallback;

    if (!selected) {
      setThreadId(null);
      setActiveThreadInStore(null);
      setActivePathInStore(bootstrapMode === 'path' ? (preferredPathId || null) : null);
      setActiveLearningSectionInStore(null);
      useAppStore.getState().clearChatHistory();
      return null;
    }

    setThreadId(selected.id);
    setActiveThreadInStore(selected.id);
    setActivePathInStore(selected.learning_path_id || null);
    setActiveLearningSectionInStore(selected.learning_section_id || null);
    if (options?.hydrateMessages !== false) {
      await hydrateThreadMessages(selected.id);
    }
    return selected.id;
  }, [
    bootstrapMode,
    hydrateThreadMessages,
    preferredPathId,
    refreshThreadsInStore,
    setActiveLearningSectionInStore,
    setActivePathInStore,
    setActiveThreadInStore,
    userId,
  ]);

  useEffect(() => {
    if (!userId) {
      bootstrappedUserRef.current = null;
      setThreadId(null);
      setActiveThreadInStore(null);
      setActivePathInStore(null);
      setActiveLearningSectionInStore(null);
      refreshThreadsInStore([]);
      useAppStore.getState().clearChatHistory();
      setLoading(false);
      return;
    }

    const bootstrapKey = `${userId}:${bootstrapMode}:${preferredPathId || 'none'}`;
    if (bootstrappedUserRef.current === bootstrapKey) return;
    bootstrappedUserRef.current = bootstrapKey;

    if (bootstrapMode === 'new') {
      setThreadId(null);
      setActiveThreadInStore(null);
      setActivePathInStore(null);
      setActiveLearningSectionInStore(null);
      useAppStore.getState().clearChatHistory();
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const bootstrapPreferredThreadId = bootstrapMode === 'default'
          ? useAppStore.getState().activeThreadId
          : null;
        await fetchThreads(bootstrapPreferredThreadId);
      } catch (err) {
        if (!cancelled) {
          console.error('useChatSession bootstrap error:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    bootstrapMode,
    fetchThreads,
    preferredPathId,
    refreshThreadsInStore,
    setActiveLearningSectionInStore,
    setActivePathInStore,
    setActiveThreadInStore,
    userId,
  ]);

  useEffect(() => {
    if (!userId) return;
    if (bootstrapMode === 'new') return;
    if (!activeThreadId) return;
    if (activeThreadId === threadId) return;

    if (bootstrapMode === 'path' && preferredPathId) {
      const candidate = threads.find((thread) => thread.id === activeThreadId) || null;
      if (!candidate || candidate.learning_path_id !== preferredPathId) {
        return;
      }
    }

    let cancelled = false;
    (async () => {
      try {
        const selected = threads.find((thread) => thread.id === activeThreadId) || null;
        setThreadId(activeThreadId);
        if (selected) {
          setActivePathInStore(selected.learning_path_id || null);
          setActiveLearningSectionInStore(selected.learning_section_id || null);
        }
        await hydrateThreadMessages(activeThreadId);
        if (cancelled) return;
        await fetchThreads(activeThreadId);
      } catch (err) {
        if (!cancelled) {
          console.error('useChatSession external activeThread sync error:', err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    activeThreadId,
    bootstrapMode,
    fetchThreads,
    hydrateThreadMessages,
    preferredPathId,
    setActiveLearningSectionInStore,
    setActivePathInStore,
    threadId,
    threads,
    userId,
  ]);

  const resolveWorldTheme = useCallback(async (selectedThread: { learning_module_id?: string | null } | null) => {
    if (!selectedThread?.learning_module_id) {
      exitWorld();
      return;
    }
    try {
      const { data } = await supabase
        .from('learning_modules')
        .select('theme_override')
        .eq('id', selectedThread.learning_module_id)
        .single();
      if (data?.theme_override) {
        enterWorld(data.theme_override as string);
      } else {
        exitWorld();
      }
    } catch {
      exitWorld();
    }
  }, [enterWorld, exitWorld]);

  useEffect(() => {
    if (!userId) {
      exitWorld();
      return;
    }

    const currentId = activeThreadId || threadId;
    if (!currentId) {
      exitWorld();
      return;
    }

    const selected = threads.find((thread) => thread.id === currentId) || null;
    void resolveWorldTheme(selected);
  }, [activeThreadId, exitWorld, resolveWorldTheme, threadId, threads, userId]);

  const setActiveThread = useCallback(async (nextThreadId: string | null) => {
    if (!nextThreadId) {
      setThreadId(null);
      setActiveThreadInStore(null);
      setActivePathInStore(bootstrapMode === 'path' ? (preferredPathId || null) : null);
      setActiveLearningSectionInStore(null);
      useAppStore.getState().clearChatHistory();
      exitWorld();
      return;
    }

    const selected = threads.find((thread) => thread.id === nextThreadId) || null;
    setThreadId(nextThreadId);
    setActiveThreadInStore(nextThreadId);
    await hydrateThreadMessages(nextThreadId);
    await fetchThreads(nextThreadId);
    const refreshed = useAppStore.getState().threads.find((thread) => thread.id === nextThreadId) || selected;
    await resolveWorldTheme(refreshed || null);
  }, [
    bootstrapMode,
    exitWorld,
    fetchThreads,
    hydrateThreadMessages,
    preferredPathId,
    resolveWorldTheme,
    setActiveLearningSectionInStore,
    setActivePathInStore,
    setActiveThreadInStore,
    threads,
  ]);

  const startNewSession = useCallback(async (input?: CreateThreadInput) => {
    if (!userId) {
      console.error('[useChatSession] No userId available for startNewThread');
      return null;
    }

    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (!authSession?.access_token) {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshed.session?.access_token) {
        console.error('[useChatSession] Auth refresh failed:', refreshError?.message);
        return null;
      }
    }

    if (!input?.skipLimitCheck) {
      let limitStatus: unknown = null;
      let limitErr: { message?: string } | null = null;

      const limitPathResponse = await supabase.rpc('can_create_learning_path', {
        p_user_id: userId,
      });
      limitStatus = limitPathResponse.data;
      limitErr = limitPathResponse.error;

      if (limitErr) {
        const limitThreadResponse = await supabase.rpc('can_create_learning_thread', {
          p_user_id: userId,
        });
        limitStatus = limitThreadResponse.data;
        limitErr = limitThreadResponse.error;
      }

      const limitRow = Array.isArray(limitStatus) ? limitStatus[0] : limitStatus;
      const limitRowRecord = (limitRow || null) as {
        can_create?: boolean;
        current_count?: number;
        path_limit?: number;
        thread_limit?: number;
      } | null;
      const resolvedCurrentCount = Number(limitRowRecord?.current_count || 0);
      const resolvedLimit = Number(
        limitRowRecord?.path_limit
        || limitRowRecord?.thread_limit
        || 0,
      );

      if (!limitErr && limitRowRecord && limitRowRecord.can_create === false) {
        useAppStore.getState().setThreadPlanLimitState({
          canCreate: false,
          currentCount: resolvedCurrentCount,
          threadLimit: resolvedLimit,
        });
        return null;
      }
      if (!limitErr && limitRowRecord) {
        useAppStore.getState().setThreadPlanLimitState({
          canCreate: true,
          currentCount: resolvedCurrentCount,
          threadLimit: resolvedLimit,
        });
      }
    }

    const learningGoal = normalizeText(input?.learningGoal, 500);
    const goalApplication = normalizeText(input?.goalApplication, 300);
    const goalHorizon: GoalHorizon = input?.goalHorizon || '30d';
    const focusInstruction = normalizeText(input?.focusInstruction, 500);
    const assistantSkillContext = input?.assistantSkillContext && typeof input.assistantSkillContext === 'object'
      ? input.assistantSkillContext
      : null;
    const learningPathId = normalizeText(input?.learningPathId, 100);
    const learningModuleId = normalizeText(input?.learningModuleId, 100);
    const learningSectionId = normalizeText(input?.learningSectionId, 100);
    const requestedContextType: LearningContextType = input?.contextType
      || (input?.contextOrgId ? 'organization' : 'personal');
    const requestedContextOrgId = requestedContextType === 'organization'
      ? normalizeText(input?.contextOrgId || null, 100)
      : null;
    if (requestedContextType === 'organization' && !requestedContextOrgId) {
      console.error('[useChatSession] context_org_id is required for organization context');
      return null;
    }
    const threadTitle = learningGoal ? learningGoal.slice(0, 80) : 'Nueva ruta de aprendizaje';

    const insertPayload = {
      user_id: userId,
      agent_mode: agentMode,
      title: threadTitle,
      thread_type: 'learning_goal',
      thread_status: 'active' as const,
      learning_goal: learningGoal,
      goal_application: goalApplication,
      goal_horizon: goalHorizon,
      focus_instruction: focusInstruction,
      is_global: true,
      last_agent_mode: agentMode,
      web_grounding_enabled: true,
      requires_freshness: false,
      assistant_skill: 'default',
      assistant_skill_context: assistantSkillContext || {},
      context_type: requestedContextType,
      context_org_id: requestedContextOrgId,
      learning_path_id: learningPathId,
      learning_module_id: learningModuleId,
      learning_section_id: learningSectionId,
    };

    let data: { id: string } | null = null;
    let error: SupabaseQueryError = null;

    const primaryInsert = await supabase
      .from('chat_sessions')
      .insert(insertPayload)
      .select('id')
      .single();
    data = primaryInsert.data;
    error = primaryInsert.error;

    if (error && isMissingColumnError(error, ['context_type', 'context_org_id', 'assistant_skill', 'assistant_skill_context'])) {
      const legacyInsertPayload: Record<string, unknown> = { ...insertPayload };
      delete legacyInsertPayload.context_type;
      delete legacyInsertPayload.context_org_id;
      delete legacyInsertPayload.assistant_skill;
      delete legacyInsertPayload.assistant_skill_context;
      const fallbackInsert = await supabase
        .from('chat_sessions')
        .insert(legacyInsertPayload)
        .select('id')
        .single();
      data = fallbackInsert.data;
      error = fallbackInsert.error;
    }

    if (error || !data) {
      console.error('[useChatSession] Failed to create thread:', error?.message, error?.code, error?.details, error);
      return null;
    }

    useAppStore.getState().clearChatHistory();
    setThreadId(data.id);
    setActiveThreadInStore(data.id);
    // Explicitly clear learning context BEFORE fetchThreads to prevent stale context
    setActivePathInStore(null);
    setActiveLearningSectionInStore(null);
    exitWorld();
    await fetchThreads(data.id);
    return data.id;
  }, [agentMode, exitWorld, fetchThreads, setActiveLearningSectionInStore, setActivePathInStore, setActiveThreadInStore, userId]);

  const updateThreadStatus = useCallback(async (targetThreadId: string, status: ThreadStatus) => {
    const patch: Record<string, unknown> = {
      thread_status: status,
      last_agent_mode: agentMode,
    };
    if (status === 'completed') {
      patch.completed_at = new Date().toISOString();
    }
    if (status === 'paused') {
      patch.paused_at = new Date().toISOString();
    }
    if (status === 'active') {
      patch.paused_at = null;
    }

    const { error } = await supabase
      .from('chat_sessions')
      .update(patch)
      .eq('id', targetThreadId)
      .eq('user_id', userId || '');

    if (error) {
      console.error('[useChatSession] Failed to update thread status:', error.message);
      return false;
    }

    updateThreadStatusInStore(targetThreadId, status);
    await fetchThreads(targetThreadId);
    return true;
  }, [agentMode, fetchThreads, updateThreadStatusInStore, userId]);

  const updateThreadGoal = useCallback(async (
    targetThreadId: string,
    updates: Partial<{
      learningGoal: string;
      goalApplication: string;
      goalHorizon: GoalHorizon;
      focusInstruction: string;
      title: string;
    }>,
  ) => {
    const payload: Record<string, unknown> = {};
    if (typeof updates.learningGoal === 'string') payload.learning_goal = normalizeText(updates.learningGoal, 500);
    if (typeof updates.goalApplication === 'string') payload.goal_application = normalizeText(updates.goalApplication, 300);
    if (typeof updates.goalHorizon === 'string') payload.goal_horizon = updates.goalHorizon;
    if (typeof updates.focusInstruction === 'string') payload.focus_instruction = normalizeText(updates.focusInstruction, 500);
    if (typeof updates.title === 'string') payload.title = normalizeText(updates.title, 120);

    const { error } = await supabase
      .from('chat_sessions')
      .update(payload)
      .eq('id', targetThreadId)
      .eq('user_id', userId || '');

    if (error) {
      console.error('[useChatSession] Failed to update thread goal:', error.message);
      return false;
    }

    updateThreadGoalInStore(targetThreadId, {
      learning_goal: typeof payload.learning_goal === 'string' ? payload.learning_goal : null,
      goal_application: typeof payload.goal_application === 'string' ? payload.goal_application : null,
      goal_horizon: typeof payload.goal_horizon === 'string' ? payload.goal_horizon as GoalHorizon : null,
      focus_instruction: typeof payload.focus_instruction === 'string' ? payload.focus_instruction : null,
      title: typeof payload.title === 'string' ? payload.title : null,
    });
    await fetchThreads(targetThreadId);
    return true;
  }, [fetchThreads, updateThreadGoalInStore, userId]);

  const updateThreadAssistantSkill = useCallback(async (
    targetThreadId: string,
    assistantSkill: ThreadAssistantSkill,
    assistantSkillContext: Record<string, unknown>,
  ) => {
    if (assistantSkillColumnsAvailableRef.current === false) {
      return false;
    }

    const { error } = await supabase
      .from('chat_sessions')
      .update({
        assistant_skill: assistantSkill,
        assistant_skill_context: assistantSkillContext,
        last_agent_mode: agentMode,
      })
      .eq('id', targetThreadId)
      .eq('user_id', userId || '');

    if (error) {
      if (isMissingColumnError(error, ['assistant_skill', 'assistant_skill_context'])) {
        assistantSkillColumnsAvailableRef.current = false;
        console.warn('[useChatSession] assistant skill columns unavailable; using local fallback.');
      } else {
        console.error('[useChatSession] Failed to update assistant skill:', error.message);
      }
      return false;
    }

    await fetchThreads(targetThreadId, { hydrateMessages: false });
    return true;
  }, [agentMode, fetchThreads, userId]);

  const refreshThreads = useCallback(async () => {
    await fetchThreads(bootstrapMode === 'default' ? (threadId || activeThreadId) : null);
  }, [activeThreadId, bootstrapMode, fetchThreads, threadId]);

  const startNewSection = useCallback(
    async (input?: CreateThreadInput) => startNewSession(input),
    [startNewSession],
  );

  const streamMessage = useCallback(async (
    text: string,
    onToken: (token: string) => void,
    onComplete: (fullText: string, newSessionId: string) => void,
    onError: (err: string) => void,
    options?: StreamMessageOptions,
  ) => {
    activeStreamAbortRef.current?.abort();
    const abortController = new AbortController();
    activeStreamAbortRef.current = abortController;
    const streamRunId = activeStreamRunIdRef.current + 1;
    activeStreamRunIdRef.current = streamRunId;
    const clientRequestId = typeof options?.clientRequestId === 'string' && options.clientRequestId.trim().length > 0
      ? options.clientRequestId.trim()
      : crypto.randomUUID();

    let currentThreadId = threadId || activeThreadId;
    if (bootstrapMode === 'path' && preferredPathId && !currentThreadId && !activePathId) {
      const fallbackRouteThread = threads.find(
        (thread) => thread.thread_status === 'active' && thread.learning_path_id === preferredPathId,
      ) || null;
      if (fallbackRouteThread) {
        currentThreadId = fallbackRouteThread.id;
      }
    }
    if (bootstrapMode === 'path' && preferredPathId && !currentThreadId) {
      onError('Esta ruta aún no tiene una sesión activa para recibir mensajes.');
      return;
    }
    let activeThread = threads.find((thread) => thread.id === currentThreadId) || null;
    if (activeThread && activeThread.thread_status !== 'active') {
      const replacementThread = threads.find((thread) => {
        if (thread.id === activeThread?.id) return false;
        if (thread.thread_status !== 'active') return false;
        if (activeThread?.learning_path_id) {
          return thread.learning_path_id === activeThread.learning_path_id;
        }
        return false;
      }) || null;

      if (replacementThread) {
        currentThreadId = replacementThread.id;
        activeThread = replacementThread;
        setThreadId(replacementThread.id);
        setActiveThreadInStore(replacementThread.id);
      } else {
        const statusLabel = activeThread.thread_status === 'paused' ? 'pausado' : 'completado';
        onError(`Esta ruta esta ${statusLabel}. Reactivala para continuar.`);
        return;
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      let activeSession = session;

      if (!activeSession?.access_token) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        activeSession = refreshed.session;
        if (!activeSession?.access_token) {
          onError('Sesion expirada, recarga la pagina');
          return;
        }
      }

      if (!MENTOR_CHAT_BASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
        onError('Configuracion de Supabase incompleta. Verifica la URL del mentor y la publishable key resueltas para el entorno actual.');
        return;
      }

      const threadContextType: LearningContextType = activeThread?.context_type
        || 'personal';
      const threadContextOrgId = threadContextType === 'organization'
        ? (activeThread?.context_org_id || undefined)
        : undefined;
      const resolvedLearningPathId = activeThread?.learning_path_id
        || preferredPathId
        || activePathId
        || undefined;
      const resolvedLearningModuleId = activeThread?.learning_module_id || undefined;
      const resolvedLearningSectionId = activeThread?.learning_section_id
        || activeLearningSectionId
        || undefined;

      const requestBody = {
        message: text,
        thread_id: currentThreadId || undefined,
        session_id: currentThreadId || undefined,
        learning_path_id: resolvedLearningPathId,
        learning_module_id: resolvedLearningModuleId,
        learning_section_id: resolvedLearningSectionId,
        context_type: threadContextType,
        context_org_id: threadContextOrgId,
        agent_mode: agentMode,
        current_course: currentCourseId || undefined,
        skip_user_persist: options?.skipUserPersist === true ? true : undefined,
        client_request_id: clientRequestId,
        turn_origin: options?.turnOrigin,
        assistant_skill: options?.assistantSkill,
        assistant_skill_context: options?.assistantSkillContext,
        enabled_plugins: Array.isArray(options?.enabledPlugins) && options.enabledPlugins.length > 0
          ? options.enabledPlugins
          : undefined,
        internal_context: options?.internalContext && options.internalContext.trim().length > 0
          ? options.internalContext
          : undefined,
        visual_input: options?.visualInput
          ? {
            source: options.visualInput.source,
            mimeType: options.visualInput.mimeType,
            data: options.visualInput.data,
            captured_at: options.visualInput.captured_at,
            width: options.visualInput.width,
            height: options.visualInput.height,
          }
          : undefined,
        visual_inputs: options?.visualInputs?.length
          ? options.visualInputs.map((input) => ({
            source: input.source,
            mimeType: input.mimeType,
            data: input.data,
            captured_at: input.captured_at,
            width: input.width,
            height: input.height,
          }))
          : undefined,
      };

      const invokeMentorChat = async (accessToken: string) => fetch(`${MENTOR_CHAT_BASE_URL}/functions/v1/mentor-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      });

      let response = await invokeMentorChat(activeSession.access_token);
      let errBody = response.ok ? null : await parseMentorChatErrorPayload(response.clone());

      if (!response.ok && isMentorChatAuthRetryable(response, errBody)) {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        const refreshedToken = refreshed.session?.access_token;

        if (refreshedToken) {
          activeSession = refreshed.session;
          response = await invokeMentorChat(refreshedToken);
          errBody = response.ok ? null : await parseMentorChatErrorPayload(response.clone());
        } else {
          console.error('[useChatSession] Auth refresh after Invalid JWT failed:', refreshError?.message);
        }
      }

      if (!response.ok) {
        const errorCode = typeof errBody?.code === 'string' ? errBody.code : null;
        const errorMessage = typeof errBody?.error === 'string'
          ? errBody.error
          : typeof errBody?.message === 'string'
            ? errBody.message
            : `Error ${response.status}`;
        if (errorCode === 'THREAD_LIMIT_REACHED') {
          onError('THREAD_LIMIT_REACHED: Has alcanzado el limite de hilos activos para tu plan.');
          return;
        }
        if (response.status === 402) {
          onError(`INSUFFICIENT_CREDITS: ${errorMessage}`);
          return;
        }
        onError(errorCode ? `${errorCode}: ${errorMessage}` : errorMessage);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError('No se recibio streaming');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      let finalTextFromDone: string | null = null;
      let doneMeta: StreamDoneMeta | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (abortController.signal.aborted || activeStreamRunIdRef.current !== streamRunId) {
          return;
        }

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const payload = trimmed.slice(6);
          const chunk = parseSSEChunk(payload);
          const chunkRequestId = typeof (chunk as { request_id?: unknown }).request_id === 'string'
            ? (chunk as { request_id: string }).request_id
            : null;
          if (chunkRequestId && chunkRequestId !== clientRequestId) {
            continue;
          }

          switch (chunk.type) {
            case 'token':
            case 'assistant_delta':
              fullText += chunk.content;
              onToken(chunk.content);
              break;

            case 'component_start':
              if (options?.onComponentStart) {
                options.onComponentStart(chunk.componentType, chunk.seedProps);
              }
              break;

            case 'component_patch':
              if (options?.onComponentPatch) {
                options.onComponentPatch(chunk.componentType, chunk.partialPropsText);
              }
              break;

            case 'component':
              if (options?.onComponentCommit) {
                options.onComponentCommit(chunk.component);
              } else if (options?.onComponent) {
                options.onComponent(chunk.component);
              }
              break;

            case 'component_commit':
              if (options?.onComponentCommit) {
                options.onComponentCommit(chunk.component);
              }
              break;

            case 'component_error':
              if (options?.onComponentError) {
                options.onComponentError(chunk.componentType, chunk.reason);
              }
              break;

            case 'done':
              currentThreadId = chunk.thread_id || chunk.session_id;
              doneMeta = {
                session_id: chunk.session_id,
                thread_id: chunk.thread_id,
                request_id: chunk.request_id,
                learning_path_id: chunk.learning_path_id,
                learning_module_id: chunk.learning_module_id,
                learning_section_id: chunk.learning_section_id,
                final_text: chunk.final_text,
                sources: chunk.sources,
                sources_count: chunk.sources_count,
                web_grounding_used: chunk.web_grounding_used,
                research_summary: chunk.research_summary,
                route_planning_state: chunk.route_planning_state,
                route_planning_error: chunk.route_planning_error,
                usage: chunk.usage,
                credits_consumed: chunk.credits_consumed,
              };
              if (typeof chunk.final_text === 'string') {
                finalTextFromDone = chunk.final_text;
              }
              if (chunk.learning_path_id !== undefined) {
                setActivePathInStore(chunk.learning_path_id || null);
                // Trigger LeftPanel refresh so new route/modules appear immediately
                window.dispatchEvent(new CustomEvent('learning-path:refresh'));
              }
              if (chunk.learning_section_id !== undefined) {
                setActiveLearningSectionInStore(chunk.learning_section_id || null);
                // Refresh route tree when a section is updated/approved.
                window.dispatchEvent(new CustomEvent('learning-path:refresh'));
              }
              setThreadId(currentThreadId);
              setActiveThreadInStore(currentThreadId);
              break;

            default:
              break;
          }
        }
      }

      if (!currentThreadId) {
        if (!threadId && !activeThreadId) {
          onError('No se pudo sincronizar la seccion del chat.');
          return;
        }
        currentThreadId = threadId || activeThreadId;
      }

      setThreadId(currentThreadId);
      setActiveThreadInStore(currentThreadId);
      await fetchThreads(currentThreadId, { hydrateMessages: false });
      if (doneMeta && options?.onDoneMeta) {
        options.onDoneMeta(doneMeta);
      }
      onComplete(finalTextFromDone ?? fullText, currentThreadId);
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      onError(msg);
    } finally {
      if (activeStreamAbortRef.current === abortController) {
        activeStreamAbortRef.current = null;
      }
    }
  }, [
    activeLearningSectionId,
    activePathId,
    activeThreadId,
    agentMode,
    bootstrapMode,
    currentCourseId,
    fetchThreads,
    preferredPathId,
    setActiveLearningSectionInStore,
    setActivePathInStore,
    setActiveThreadInStore,
    threadId,
    threads,
  ]);

  useEffect(() => {
    return () => {
      activeStreamAbortRef.current?.abort();
      activeStreamAbortRef.current = null;
    };
  }, []);

  return {
    sessionId: threadId,
    threadId,
    loading,
    streamMessage,
    startNewSession,
    startNewSection,
    setActiveThread,
    updateThreadStatus,
    updateThreadGoal,
    updateThreadAssistantSkill,
    refreshThreads,
  };
}
