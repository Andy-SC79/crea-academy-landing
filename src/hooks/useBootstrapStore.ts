/**
 * ═══════════════════════════════════════════════════════════
 * useBootstrapStore — Hydrate Zustand from Supabase on mount
 * ═══════════════════════════════════════════════════════════
 *
 * Called once inside OneSinglePage. Loads:
 *  - enrollments + progress
 *  - XP / level / credits / badge count
 *  - agent personalization (name, avatar, voice, personality)
 *  - UI preferences (colors, theme, font)
 *  - social feed + live events + ranking + challenges
 *  - realtime subscriptions
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBillingAccess } from '@/hooks/useBillingAccess';
import { useI365Payments } from '@/hooks/useI365Payments';
import { useOrgExperienceSettings } from '@/hooks/useOrgExperienceSettings';
import {
  disableBackendCapability,
  getErrorMessage,
  getFunctionErrorStatus,
  isBackendCapabilityDisabled,
  isRpcMissingError,
} from '@/lib/backend-capabilities';
import { normalizeI365BalanceSummary } from '@/lib/i365-balance';
import { loadOrgOnboardingEnabled } from '@/lib/onboarding-questions';
import { buildLearningPathProgressMap } from '@/lib/learning-progress';
import { hasExplicitThemeSelection } from '@/lib/theme-preference';
import {
  useAppStore,
  type ChallengeItem,
  type Enrollment,
  type FeedItem,
  type LiveEvent,
  type RankingEntry,
} from '@/stores/useAppStore';

function asNullableNumber(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return value;
}

function sumXpEarnedFromActivities(rows: unknown): number | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  let total = 0;
  let hasNumeric = false;

  for (const row of rows) {
    const xp = asNullableNumber((row as Record<string, unknown> | null)?.xp_earned);
    if (xp === null) continue;
    total += xp;
    hasNumeric = true;
  }

  return hasNumeric ? total : null;
}

function resolveEventStartIso(eventDate: unknown, eventTime: unknown): string {
  const rawDate = typeof eventDate === 'string' ? eventDate.trim() : '';
  if (!rawDate) return new Date().toISOString();

  // If DB already provides full ISO, keep it as-is.
  if (rawDate.includes('T')) return rawDate;

  const rawTime = typeof eventTime === 'string' ? eventTime.trim() : '';
  const normalizedTime = /^\d{2}:\d{2}/.test(rawTime) ? rawTime.slice(0, 5) : '00:00';

  return `${rawDate}T${normalizedTime}:00`;
}

function resolveLiveEventType(value: unknown): LiveEvent['type'] {
  if (value === 'taller' || value === 'bootcamp' || value === 'meetup') {
    return value;
  }

  if (typeof value !== 'string') return 'taller';

  const normalized = value.trim().toLowerCase();
  if (normalized.includes('bootcamp')) return 'bootcamp';
  if (normalized.includes('meet')) return 'meetup';
  return 'taller';
}

function isEventLive(startsAt: string): boolean {
  const startMs = Date.parse(startsAt);
  if (Number.isNaN(startMs)) return false;
  const nowMs = Date.now();
  const liveWindowEnd = startMs + (2 * 60 * 60 * 1000);
  return nowMs >= startMs && nowMs <= liveWindowEnd;
}

function clampPercent(value: unknown): number | null {
  const numeric = asNullableNumber(value);
  if (numeric === null) return null;
  if (numeric < 0) return 0;
  if (numeric > 100) return 100;
  return numeric;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hslStringToHex(hsl: string): string | null {
  const parts = hsl.replace(/%/g, '').trim().split(/\s+/).map(Number);
  if (parts.length < 3 || parts.slice(0, 3).some((value) => !Number.isFinite(value))) {
    return null;
  }

  const [rawHue, rawSaturation, rawLightness] = parts as [number, number, number];
  const hue = ((rawHue % 360) + 360) % 360;
  const saturation = clampNumber(rawSaturation, 0, 100) / 100;
  const lightness = clampNumber(rawLightness, 0, 100) / 100;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = hue / 60;
  const x = chroma * (1 - Math.abs((sector % 2) - 1));
  const match = lightness - chroma / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (sector >= 0 && sector < 1) {
    rPrime = chroma;
    gPrime = x;
  } else if (sector >= 1 && sector < 2) {
    rPrime = x;
    gPrime = chroma;
  } else if (sector >= 2 && sector < 3) {
    gPrime = chroma;
    bPrime = x;
  } else if (sector >= 3 && sector < 4) {
    gPrime = x;
    bPrime = chroma;
  } else if (sector >= 4 && sector < 5) {
    rPrime = x;
    bPrime = chroma;
  } else {
    rPrime = chroma;
    bPrime = x;
  }

  const toHex = (channel: number): string =>
    Math.round((channel + match) * 255).toString(16).padStart(2, '0');

  return `#${toHex(rPrime)}${toHex(gPrime)}${toHex(bPrime)}`;
}

function parseThemeMode(value: unknown): 'light' | 'dark' | 'auto' {
  return value === 'light' || value === 'dark' || value === 'auto'
    ? value
    : 'auto';
}

function parseThemeFontSize(value: unknown): 'sm' | 'md' | 'lg' {
  return value === 'sm' || value === 'md' || value === 'lg'
    ? value
    : 'md';
}

function parseThemeAnimationLevel(value: unknown): 'none' | 'reduced' | 'full' {
  return value === 'none' || value === 'reduced' || value === 'full'
    ? value
    : 'full';
}

function pickFirstNonEmptyString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return '';
}

function resolveProfileIntakeCheckpointStatus(
  value: unknown,
): 'in_progress' | 'completed' | null {
  const normalizeStatus = (raw: unknown): 'in_progress' | 'completed' | null => {
    if (typeof raw !== 'string') return null;
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return null;
    if (normalized.includes('complete') || normalized.includes('done') || normalized.includes('finished')) {
      return 'completed';
    }
    if (
      normalized.includes('progress')
      || normalized.includes('pending')
      || normalized.includes('required')
      || normalized.includes('iniciar')
      || normalized.includes('start')
    ) {
      return 'in_progress';
    }
    return null;
  };

  const direct = normalizeStatus(value);
  if (direct) return direct;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const checkpoint = value as Record<string, unknown>;
  return (
    normalizeStatus(checkpoint.status)
    || normalizeStatus(checkpoint.profile_intake_status)
    || normalizeStatus(checkpoint.mandatory_profile_status)
  );
}

function resolveChallengeStatus(
  statusFromRow: unknown,
  startDate: string | null,
  endDate: string | null,
): ChallengeItem['status'] {
  if (statusFromRow === 'active' || statusFromRow === 'upcoming' || statusFromRow === 'ended') {
    return statusFromRow;
  }

  const nowMs = Date.now();
  const startMs = startDate ? Date.parse(startDate) : NaN;
  const endMs = endDate ? Date.parse(endDate) : NaN;

  if (!Number.isNaN(endMs) && endMs < nowMs) return 'ended';
  if (!Number.isNaN(startMs) && startMs > nowMs) return 'upcoming';
  return 'active';
}

export function useBootstrapStore(userId: string | undefined) {
  const hydratedUserRef = useRef<string | null>(null);
  const rankingBackendAvailableRef = useRef(!isBackendCapabilityDisabled('public-gamification-ranking'));
  const { billingAccessReady, billingBypassed } = useBillingAccess();
  const { summary: loadI365Summary } = useI365Payments();
  const { effectiveOrgId, currentUserView } = useOrgExperienceSettings();
  const socialPolicyKey = [
    effectiveOrgId || 'no-org',
    currentUserView.canSeeCuratedNews ? 'feed1' : 'feed0',
    currentUserView.canSeeLiveCommunity ? 'live1' : 'live0',
    currentUserView.canSeeLeaderboard ? 'rank1' : 'rank0',
    currentUserView.canSeeChallenges ? 'challenge1' : 'challenge0',
  ].join(':');

  useEffect(() => {
    if (!userId) {
      hydratedUserRef.current = null;
      useAppStore.getState().setMentorPersonalizationHydrated(false);
      return;
    }
    if (!billingAccessReady) return;

    const hydrationKey = `${userId}:${socialPolicyKey}:${billingBypassed ? 'bypassed' : 'metered'}`;
    if (hydratedUserRef.current === hydrationKey) return;
    hydratedUserRef.current = hydrationKey;

    const store = useAppStore.getState();
    if (store.currentUserId !== userId) {
      store.resetForNewUser(userId);
    }

    const {
      setEnrollments, setXp, setLevel, setCredits, setBadgeCount,
      setLevelName,
      setMentorName, setMentorAvatar, setMentorVoice, setMentorLiveVoice, setMentorPersonality, setMentorFavoriteColor, setMentorProactiveRouteGuidanceEnabled, setMentorPersonalizationHydrated,
      setUserTheme, setOnboardingCompleted, setProfileIntakeRequired,
      setFeedItems, setLiveEvents, setRankingEntries, setChallengeItems, setOnlineCount,
    } = useAppStore.getState();

    setMentorPersonalizationHydrated(false);

    let cancelled = false;
    const canLoadFeed = currentUserView.canSeeCuratedNews;
    const canLoadLiveCommunity = currentUserView.canSeeLiveCommunity;
    const canLoadRanking = currentUserView.canSeeLeaderboard;
    const canLoadChallenges = currentUserView.canSeeChallenges;

    // ── 1. Enrollments ─────────────────────────────────────

    const loadEnrollments = async () => {
      try {
        const { data: pathRows, error: pathError } = await supabase
          .from('learning_paths')
          .select('id, title, progress_pct, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(200);

        if (pathError) throw pathError;
        if (cancelled) return;

        if (Array.isArray(pathRows) && pathRows.length > 0) {
          const pathIds = pathRows.map((path) => path.id);
          const [moduleResult, sectionResult] = await Promise.all([
            supabase
              .from('learning_modules')
              .select('id, path_id')
              .in('path_id', pathIds),
            supabase
              .from('learning_sections')
              .select('id, path_id, module_id, status, progress_pct')
              .in('path_id', pathIds),
          ]);

          if (moduleResult.error) throw moduleResult.error;
          if (sectionResult.error) throw sectionResult.error;
          if (cancelled) return;

          const moduleCountByPath = new Map<string, number>();
          for (const moduleRow of moduleResult.data || []) {
            const current = moduleCountByPath.get(moduleRow.path_id) || 0;
            moduleCountByPath.set(moduleRow.path_id, current + 1);
          }

          const progressByPath = buildLearningPathProgressMap(
            (sectionResult.data || []) as Array<{
              path_id: string;
              module_id: string;
              status: string;
              progress_pct: number;
            }>,
          );

          const enrollments: Enrollment[] = pathRows.map((path) => {
            const derivedProgress = progressByPath.get(path.id);
            const totalModules = Math.max(1, derivedProgress?.totalModules || moduleCountByPath.get(path.id) || 0);
            const progressPercentage = derivedProgress?.progressPct ?? (
              typeof path.progress_pct === 'number'
                ? Math.max(0, Math.min(100, path.progress_pct))
                : 0
            );
            const completedModules = Math.min(
              totalModules,
              derivedProgress?.completedModules ?? Math.round((progressPercentage / 100) * totalModules),
            );
            return {
              courseId: path.id,
              courseTitle: path.title || 'Ruta de aprendizaje',
              courseEmoji: '🛣️',
              progressPercentage,
              totalModules,
              completedModules,
              lastAccessedAt: path.updated_at,
            };
          });

          setEnrollments(enrollments);
          return;
        }
      } catch (routeError) {
        console.warn('[useBootstrapStore] learning_paths hydration failed, falling back to legacy:', routeError);
      }

      const { data } = await supabase
        .from('course_enrollments')
        .select('course_id, progress_percentage, courses(title, description)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (cancelled || !data) return;

      type LegacyEnrollmentRow = {
        course_id: string | null;
        progress_percentage: number | null;
        courses?: { title?: string | null; description?: string | null } | null;
      };

      const enrollments: Enrollment[] = (data as LegacyEnrollmentRow[]).map((e) => ({
        courseId: e.course_id || '',
        courseTitle: e.courses?.title || 'Curso',
        courseEmoji: '📘',
        progressPercentage: e.progress_percentage || 0,
        totalModules: 10,
        completedModules: Math.round((e.progress_percentage || 0) / 10),
      }));
      setEnrollments(enrollments);
    };

    // ── 2. XP / Level ──────────────────────────────────────

    const loadProgress = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, document_type, document_number, validated_with_topus')
        .eq('id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (profile) {
        setOnboardingCompleted(profile.onboarding_completed ?? false);
      }

      const [
        { data: gamification },
        { data: activityXpRows },
        { count: badgeActivityCount },
        { count: achievementsCount },
        { data: creditBalance },
        { data: profileIntakePersonalization },
        orgOnboardingEnabled,
      ] = await Promise.all([
        supabase
          .from('user_gamification')
          .select('total_xp, current_level, level_name')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('user_activities')
          .select('xp_earned')
          .eq('user_id', userId)
          .not('xp_earned', 'is', null),
        supabase
          .from('user_activities')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('activity_type', 'badge_earned'),
        supabase
          .from('user_achievements')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        billingBypassed
          ? Promise.resolve(null)
          : loadI365Summary().catch((error) => {
            console.warn('[useBootstrapStore] Failed loading i365 summary:', error);
            return null;
          }),
        supabase
          .from('agent_personalization')
          .select('onboarding_checkpoint')
          .eq('user_id', userId)
          .maybeSingle(),
        loadOrgOnboardingEnabled(effectiveOrgId),
      ]);

      if (cancelled) return;

      const onboardingCompleted = profile?.onboarding_completed === true;
      const isOrgProfileIntakeDisabled = Boolean(effectiveOrgId) && orgOnboardingEnabled === false;
      const profileIntakeCheckpointStatus = resolveProfileIntakeCheckpointStatus(
        profileIntakePersonalization?.onboarding_checkpoint,
      );
      const requiresProfileIntake = onboardingCompleted
        && !isOrgProfileIntakeDisabled
        && profileIntakeCheckpointStatus !== 'completed';
      setProfileIntakeRequired(requiresProfileIntake);

      const gamificationXp = asNullableNumber((gamification as Record<string, unknown> | null)?.total_xp);
      const activityXp = sumXpEarnedFromActivities(activityXpRows);
      const resolvedXp = gamificationXp ?? activityXp ?? 0;

      const gamificationLevel = asNullableNumber((gamification as Record<string, unknown> | null)?.current_level);
      let resolvedLevel = gamificationLevel ?? 1;
      let resolvedLevelName = typeof (gamification as Record<string, unknown> | null)?.level_name === 'string'
        ? String((gamification as Record<string, unknown>).level_name).toLowerCase()
        : 'novato';

      if (!gamificationLevel && resolvedXp > 0) {
        const { data: levelRows } = await supabase.rpc('calculate_level', { total_xp: resolvedXp });
        if (cancelled) return;
        const levelRow = Array.isArray(levelRows) ? levelRows[0] : null;
        const fallbackLevel = asNullableNumber((levelRow as Record<string, unknown> | null)?.level);
        const fallbackLevelName = typeof (levelRow as Record<string, unknown> | null)?.level_name === 'string'
          ? String((levelRow as Record<string, unknown>).level_name).toLowerCase()
          : null;
        resolvedLevel = fallbackLevel ?? resolvedLevel;
        resolvedLevelName = fallbackLevelName ?? resolvedLevelName;
      }

      const resolvedBadges = typeof badgeActivityCount === 'number'
        ? badgeActivityCount
        : (typeof achievementsCount === 'number' ? achievementsCount : 0);
      const normalizedBalances = normalizeI365BalanceSummary(creditBalance);
      const resolvedCredits = billingBypassed
        ? 0
        : (normalizedBalances.currentBalance ?? 0);

      setXp(resolvedXp);
      setLevel(resolvedLevel);
      setLevelName(resolvedLevelName);
      setBadgeCount(resolvedBadges);
      setCredits(resolvedCredits);
    };

    // ── 3. Agent personalization ────────────────────────────

    const loadAgent = async () => {
      try {
        const { data } = await supabase
          .from('agent_personalization')
          .select('agent_name, agent_voice, mentor_live_voice, user_avatar_animal, personality_traits, proactive_route_guidance_enabled')
          .eq('user_id', userId)
          .maybeSingle();

        if (cancelled) return;

        if (data) {
          const currentMentorAvatar = useAppStore.getState().mentorAvatar;
          const persistedAvatar = typeof data.user_avatar_animal === 'string'
            ? data.user_avatar_animal.trim()
            : '';
          setMentorName(data.agent_name || 'RapiFlash');
          setMentorAvatar(persistedAvatar || currentMentorAvatar || 'sloth');
          setMentorVoice(data.agent_voice || '');
          setMentorLiveVoice(data.mentor_live_voice || 'Zephyr');
          setMentorProactiveRouteGuidanceEnabled(data.proactive_route_guidance_enabled !== false);
          if (data.personality_traits && typeof data.personality_traits === 'object') {
            const pt = data.personality_traits as Record<string, number>;
            setMentorPersonality({
              formality: pt.formality ?? 50,
              humor: pt.humor ?? 50,
              pace: pt.pace ?? 50,
              encouragement: pt.encouragement ?? 50,
            });
          }
        }
      } finally {
        if (!cancelled) {
          setMentorPersonalizationHydrated(true);
        }
      }
    };

    // ── 4. UI preferences ──────────────────────────────────

    const loadTheme = async () => {
      const { data } = await supabase
        .from('user_ui_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        const persistedThemeMode = parseThemeMode(data.theme);
        const explicitThemeSelection = hasExplicitThemeSelection(userId);
        const localThemeMode = useAppStore.getState().userTheme.theme;
        const nextThemeMode = persistedThemeMode === 'light' || persistedThemeMode === 'dark'
          ? (explicitThemeSelection ? persistedThemeMode : 'auto')
          : (
            explicitThemeSelection && (localThemeMode === 'light' || localThemeMode === 'dark')
              ? localThemeMode
              : 'auto'
          );

        setUserTheme({
          primaryColor: data.primary_color,
          secondaryColor: data.secondary_color,
          accentColor: data.accent_color,
          theme: nextThemeMode,
          fontSize: parseThemeFontSize(data.font_size),
          animationLevel: parseThemeAnimationLevel(data.animation_level),
        });

        const favoriteColor = hslStringToHex(data.primary_color);
        if (favoriteColor) {
          setMentorFavoriteColor(favoriteColor.toLowerCase());
        }

        if (!explicitThemeSelection && (persistedThemeMode === 'light' || persistedThemeMode === 'dark')) {
          await supabase
            .from('user_ui_preferences')
            .upsert({ user_id: userId, theme: 'auto' }, { onConflict: 'user_id' });
        }
      }
    };

    // ── 5. Social feed + live events ──────────────────────

    const loadLiveEvents = async () => {
      if (!canLoadLiveCommunity) {
        setLiveEvents([]);
        return;
      }
      const { data: events, error } = await supabase
        .from('course_events')
        .select('id, title, event_date, event_time, type, is_published')
        .eq('is_published', true)
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true })
        .limit(20);

      if (cancelled) return;

      if (error) {
        console.warn('[useBootstrapStore] course_events error:', error.message);
        setLiveEvents([]);
        return;
      }

      const nowMs = Date.now();
      const liveEvents: LiveEvent[] = Array.isArray(events)
        ? events
          .map((event) => {
            const startsAt = resolveEventStartIso(event.event_date, event.event_time);
            return {
              id: event.id,
              title: event.title,
              startsAt,
              type: resolveLiveEventType(event.type),
              isLive: isEventLive(startsAt),
            } satisfies LiveEvent;
          })
          // Keep upcoming events and also those that started recently.
          .filter((event) => {
            const startMs = Date.parse(event.startsAt);
            return Number.isNaN(startMs) || startMs >= (nowMs - (2 * 60 * 60 * 1000));
          })
          .slice(0, 8)
        : [];

      setLiveEvents(liveEvents);
    };

    const loadRanking = async () => {
      if (!canLoadRanking || !rankingBackendAvailableRef.current) {
        setRankingEntries([]);
        return;
      }
      type RankingRpcRow = {
        rank_position: number | string | null;
        user_id: string | null;
        display_name: string | null;
        avatar_url: string | null;
        total_xp: number | string | null;
        current_level: number | string | null;
        level_name: string | null;
        badge_count: number | string | null;
      };

      const asInt = (value: number | string | null | undefined, fallback: number): number => {
        if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
        if (typeof value === 'string' && value.trim().length > 0) {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) return Math.round(parsed);
        }
        return fallback;
      };

      const normalizeRows = (rows: RankingRpcRow[] | null | undefined): RankingRpcRow[] => (
        Array.isArray(rows)
          ? rows
            .filter((row) => typeof row.user_id === 'string' && row.user_id.trim().length > 0)
            .slice(0, 20)
          : []
      );
      const asNonEmpty = (rows: RankingRpcRow[]): RankingRpcRow[] | null => (
        rows.length > 0 ? rows : null
      );
      const disableRankingBackend = () => {
        rankingBackendAvailableRef.current = false;
        disableBackendCapability('public-gamification-ranking');
      };

      const loadRankingFromRpc = async (): Promise<RankingRpcRow[] | null> => {
        const { data, error } = await supabase.rpc('get_public_gamification_ranking', { p_limit: 20 });
        if (cancelled) return null;
        if (error) {
          if (isRpcMissingError(error)) {
            disableRankingBackend();
            return null;
          }
          console.warn('[useBootstrapStore] ranking rpc error:', error.message);
          return null;
        }
        return asNonEmpty(normalizeRows(data as RankingRpcRow[] | null));
      };

      const loadRankingFromEdgeFunction = async (): Promise<RankingRpcRow[] | null> => {
        const { data, error } = await supabase.functions.invoke('public-gamification-ranking', {
          body: { limit: 20 },
        });
        if (cancelled) return null;
        if (error) {
          const status = getFunctionErrorStatus(error);
          if (status === 401 || status === 403 || status === 404 || status === 500) {
            disableRankingBackend();
            return null;
          }
          console.warn('[useBootstrapStore] ranking edge function error:', getErrorMessage(error) || error.message);
          return null;
        }
        const payload = (data ?? {}) as Record<string, unknown>;
        const candidateRows = Array.isArray(payload.rows)
          ? payload.rows
          : Array.isArray(data)
            ? data
            : [];
        return asNonEmpty(normalizeRows(candidateRows as RankingRpcRow[]));
      };

      const rowsFromEdgeFunction = await loadRankingFromEdgeFunction();
      const normalizedRows = rowsFromEdgeFunction
        || (rankingBackendAvailableRef.current ? (await loadRankingFromRpc()) : null)
        || [];

      if (normalizedRows.length === 0) {
        setRankingEntries([]);
        return;
      }

      const rankingEntries: RankingEntry[] = normalizedRows.map((row, index) => ({
        rank: asInt(row.rank_position, index + 1),
        userId: (row.user_id as string).trim(),
        displayName: typeof row.display_name === 'string' && row.display_name.trim().length > 0
          ? row.display_name.trim()
          : 'Estudiante',
        avatarUrl: typeof row.avatar_url === 'string' && row.avatar_url.trim().length > 0
          ? row.avatar_url
          : null,
        totalXp: asInt(row.total_xp, 0),
        level: asInt(row.current_level, 1),
        levelName: typeof row.level_name === 'string' && row.level_name.trim().length > 0
          ? row.level_name.trim().toLowerCase()
          : 'novato',
        badgeCount: asInt(row.badge_count, 0),
      }));

      setRankingEntries(rankingEntries);
    };

    const loadChallenges = async () => {
      if (!canLoadChallenges) {
        setChallengeItems([]);
        return;
      }
      const { data: rawChallenges, error: challengesError } = await supabase
        .from('course_challenges' as never)
        .select('id, course_id, title, description, xp_reward, start_date, end_date, created_at, courses(title)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (cancelled) return;

      if (challengesError) {
        console.warn('[useBootstrapStore] course_challenges error:', challengesError.message);
        setChallengeItems([]);
        return;
      }

      const rawList: Record<string, unknown>[] = Array.isArray(rawChallenges)
        ? rawChallenges as Record<string, unknown>[]
        : [];

      const courseIds = Array.from(
        new Set(
          rawList
            .map((row) => (typeof row.course_id === 'string' ? row.course_id : null))
            .filter((value): value is string => Boolean(value)),
        ),
      );

      const progressMap = new Map<string, number>();
      if (courseIds.length > 0) {
        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select('course_id, progress_percentage')
          .eq('user_id', userId)
          .in('course_id', courseIds);

        if (!cancelled && Array.isArray(enrollments)) {
          for (const enrollment of enrollments) {
            if (typeof enrollment.course_id !== 'string') continue;
            const progress = clampPercent(enrollment.progress_percentage);
            if (progress === null) continue;
            const current = progressMap.get(enrollment.course_id) ?? 0;
            if (progress > current) progressMap.set(enrollment.course_id, progress);
          }
        }
      }

      const fallbackItems: ChallengeItem[] = rawList.map((row) => {
        const courseId = typeof row.course_id === 'string' ? row.course_id : null;
        const startDate = typeof row.start_date === 'string' ? row.start_date : null;
        const endDate = typeof row.end_date === 'string' ? row.end_date : null;
        const courseData = row.courses && typeof row.courses === 'object'
          ? row.courses as Record<string, unknown>
          : null;

        return {
          id: typeof row.id === 'string' ? row.id : crypto.randomUUID(),
          courseId,
          courseTitle: typeof courseData?.title === 'string' && courseData.title.trim().length > 0
            ? courseData.title.trim()
            : 'Curso',
          title: typeof row.title === 'string' ? row.title : 'Reto',
          description: typeof row.description === 'string' ? row.description : '',
          xpReward: asNullableNumber(row.xp_reward) ?? 0,
          startDate,
          endDate,
          status: resolveChallengeStatus(null, startDate, endDate),
          myCompleted: false,
          myCourseProgress: courseId ? (progressMap.get(courseId) ?? null) : null,
          totalCompletions: 0,
        } satisfies ChallengeItem;
      });

      const challengeIds = fallbackItems
        .map((item) => (typeof item.id === 'string' ? item.id : ''))
        .filter((value) => value.length > 0);
      const challengeRefs = challengeIds.flatMap((id) => [id, `challenge:${id}`]);
      const completionsByChallenge = new Map<string, Set<string>>();
      const myCompletedByChallenge = new Map<string, boolean>();

      if (challengeRefs.length > 0) {
        const { data: completionRows, error: completionError } = await supabase
          .from('user_activities')
          .select('user_id, activity_reference')
          .in('activity_reference', challengeRefs);

        if (cancelled) return;

        if (completionError) {
          console.warn('[useBootstrapStore] challenge completions error:', completionError.message);
        } else if (Array.isArray(completionRows)) {
          for (const row of completionRows as Array<{ user_id: string; activity_reference: string | null }>) {
            if (typeof row.activity_reference !== 'string' || typeof row.user_id !== 'string') continue;
            const normalizedRef = row.activity_reference.startsWith('challenge:')
              ? row.activity_reference.slice('challenge:'.length)
              : row.activity_reference;
            if (!normalizedRef) continue;
            const set = completionsByChallenge.get(normalizedRef) ?? new Set<string>();
            set.add(row.user_id);
            completionsByChallenge.set(normalizedRef, set);
            if (row.user_id === userId) {
              myCompletedByChallenge.set(normalizedRef, true);
            }
          }
        }
      }

      const withCompletionStats = fallbackItems.map((item) => ({
        ...item,
        myCompleted: myCompletedByChallenge.get(item.id) ?? false,
        totalCompletions: completionsByChallenge.get(item.id)?.size ?? 0,
      }));

      setChallengeItems(withCompletionStats);
    };

    const loadFeed = async () => {
      if (!canLoadFeed) {
        setFeedItems([]);
        return;
      }
      const [
        { data: socialFeedData, error: socialFeedError },
        { data: curatedNewsData, error: curatedNewsError },
      ] = await Promise.all([
        supabase
          .from('social_feed')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('news' as never)
          .select('id, title, url, published_at, created_at, is_active, is_published, news_items, week_start, week_end')
          .eq('is_active', true)
          .order('week_start', { ascending: false, nullsFirst: false })
          .order('published_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (cancelled) return;

      if (socialFeedError) {
        console.warn('[useBootstrapStore] social_feed error:', socialFeedError.message);
      }
      if (curatedNewsError) {
        console.warn('[useBootstrapStore] news fallback error:', curatedNewsError.message);
      }
      const language = useAppStore.getState().language;

      const validFeedTypes = new Set<FeedItem['type']>(['news', 'podcast', 'achievement', 'event', 'challenge', 'tip']);

      const socialItems: FeedItem[] = Array.isArray(socialFeedData)
        ? socialFeedData
          .map((d) => {
            const title = typeof d.title === 'string' ? d.title.trim() : '';
            if (!title) return null;

            const metadata = d.metadata && typeof d.metadata === 'object'
              ? d.metadata as Record<string, unknown>
              : undefined;

            const type = typeof d.type === 'string' && validFeedTypes.has(d.type as FeedItem['type'])
              ? d.type as FeedItem['type']
              : 'tip';

            const metadataPublishedAt = pickFirstNonEmptyString(
              metadata?.published_at,
              metadata?.publishedAt,
            );

            const createdAt = metadataPublishedAt
              || (typeof d.created_at === 'string' && d.created_at.trim().length > 0
                ? d.created_at
                : new Date().toISOString());

            return {
              id: d.id,
              type,
              title,
              content: typeof d.content === 'string' ? d.content : '',
              createdAt,
              metadata,
            } satisfies FeedItem;
          })
          .filter((item): item is FeedItem => item !== null)
        : [];

      const curatedNewsItems: FeedItem[] = Array.isArray(curatedNewsData)
        ? curatedNewsData.flatMap((row: Record<string, unknown>) => {
          const rowId = typeof row.id === 'string' && row.id.trim().length > 0 ? row.id : crypto.randomUUID();
          const weekTitle = typeof row.title === 'string' ? row.title.trim() : '';
          const rowCreatedAt = typeof row.created_at === 'string' && row.created_at.trim().length > 0
            ? row.created_at
            : new Date().toISOString();
          const rowPublishedAt = typeof row.published_at === 'string' && row.published_at.trim().length > 0
            ? row.published_at
            : rowCreatedAt;
          const weekStart = typeof row.week_start === 'string' ? row.week_start : null;
          const weekEnd = typeof row.week_end === 'string' ? row.week_end : null;
          const isPublished = row.is_published === true;
          const rowItems = Array.isArray(row.news_items) ? row.news_items : [];

          if (rowItems.length > 0) {
            if (!isPublished) return [];

            return rowItems
              .map((rawItem: unknown, index) => {
                const item = rawItem && typeof rawItem === 'object'
                  ? rawItem as Record<string, unknown>
                  : {};
                const title = typeof item.title === 'string' ? item.title.trim() : '';
                const url = typeof item.url === 'string' ? item.url.trim() : '';
                if (!title || !url) return null;

                const description = typeof item.description === 'string' ? item.description : '';
                const itemType: FeedItem['type'] = item.type === 'podcast' ? 'podcast' : 'news';
                const imageUrl = typeof item.image_url === 'string' ? item.image_url.trim() : '';
                const audioUrl = typeof item.audio_url === 'string' ? item.audio_url.trim() : '';
                const source = typeof item.source === 'string' && item.source.trim().length > 0
                  ? item.source.trim()
                  : (weekTitle || 'Crea News');
                const publishedAt = typeof item.published_at === 'string' && item.published_at.trim().length > 0
                  ? item.published_at
                  : rowPublishedAt;

                return {
                  id: `manual-news-${rowId}-${index}`,
                  type: itemType,
                  title,
                  content: description,
                  createdAt: publishedAt,
                  metadata: {
                    source,
                    url,
                    sourceUrl: url,
                    imageUrl: imageUrl || null,
                    audioUrl: audioUrl || null,
                    provider: 'manual_weekly_news',
                    weekTitle: weekTitle || null,
                    weekStart,
                    weekEnd,
                  },
                } satisfies FeedItem;
              })
              .filter((item): item is FeedItem => item !== null);
          }

          return [];
        })
        : [];

      const mergedByKey = new Map<string, FeedItem>();
      for (const item of [...curatedNewsItems, ...socialItems]) {
        const metadata = item.metadata && typeof item.metadata === 'object'
          ? item.metadata as Record<string, unknown>
          : {};
        const url = typeof metadata.url === 'string' ? metadata.url.trim() : '';
        const sourceUrl = typeof metadata.sourceUrl === 'string' ? metadata.sourceUrl.trim() : '';
        const titleKey = typeof item.title === 'string' ? item.title.toLowerCase().trim() : '';
        const key = url || sourceUrl || (titleKey ? `${item.type}:${titleKey}` : item.id);
        const prev = mergedByKey.get(key);
        if (!prev) {
          mergedByKey.set(key, item);
          continue;
        }
        const itemTs = Date.parse(item.createdAt);
        const prevTs = Date.parse(prev.createdAt);
        if ((Number.isNaN(itemTs) ? 0 : itemTs) > (Number.isNaN(prevTs) ? 0 : prevTs)) {
          mergedByKey.set(key, item);
        }
      }

      const mergedItems = Array.from(mergedByKey.values())
        .sort((a, b) => {
          const bTs = Date.parse(b.createdAt);
          const aTs = Date.parse(a.createdAt);
          return (Number.isNaN(bTs) ? 0 : bTs) - (Number.isNaN(aTs) ? 0 : aTs);
        })
        .slice(0, 30);

      if (mergedItems.length === 0) {
        const fallbackByLanguage: Record<string, { title: string; content: string }> = {
          es: {
            title: 'Actualizando feed de IA',
            content: 'No se pudieron cargar noticias en este momento. Intenta de nuevo en unos segundos.',
          },
          en: {
            title: 'Updating AI feed',
            content: 'News could not be loaded right now. Please try again in a few seconds.',
          },
          pt: {
            title: 'Atualizando feed de IA',
            content: 'Nao foi possivel carregar noticias agora. Tente novamente em alguns segundos.',
          },
        };
        const fallback = fallbackByLanguage[language] || fallbackByLanguage.es;
        setFeedItems([{
          id: `feed-fallback-${Date.now()}`,
          type: 'tip',
          title: fallback.title,
          content: fallback.content,
          createdAt: new Date().toISOString(),
          metadata: {
            source: 'Crea Academy',
            provider: 'fallback',
          },
        }]);
      } else {
        setFeedItems(mergedItems);
      }

    };

    // ── Execute all ────────────────────────────────────────

    Promise.all([
      loadEnrollments(),
      loadProgress(),
      loadAgent(),
      loadTheme(),
      loadFeed(),
      loadLiveEvents(),
      loadRanking(),
      loadChallenges(),
    ]).catch(console.error);

    // ── 6. Realtime subscriptions ──────────────────────────

    let progressReloadTimer: ReturnType<typeof setTimeout> | null = null;
    let enrollmentReloadTimer: ReturnType<typeof setTimeout> | null = null;
    let liveEventsReloadTimer: ReturnType<typeof setTimeout> | null = null;
    let socialGamificationReloadTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerProgressReload = () => {
      if (cancelled) return;
      if (progressReloadTimer) clearTimeout(progressReloadTimer);
      progressReloadTimer = setTimeout(() => {
        if (cancelled) return;
        void loadProgress();
        if (canLoadRanking) void loadRanking();
        if (canLoadChallenges) void loadChallenges();
      }, 120);
    };

    const triggerEnrollmentReload = () => {
      if (cancelled) return;
      if (enrollmentReloadTimer) clearTimeout(enrollmentReloadTimer);
      enrollmentReloadTimer = setTimeout(() => {
        if (cancelled) return;
        void loadEnrollments();
      }, 120);
    };

    const triggerLiveEventsReload = () => {
      if (cancelled) return;
      if (liveEventsReloadTimer) clearTimeout(liveEventsReloadTimer);
      liveEventsReloadTimer = setTimeout(() => {
        if (cancelled) return;
        void loadLiveEvents();
      }, 150);
    };

    const triggerSocialGamificationReload = () => {
      if (cancelled) return;
      if (socialGamificationReloadTimer) clearTimeout(socialGamificationReloadTimer);
      socialGamificationReloadTimer = setTimeout(() => {
        if (cancelled) return;
        if (canLoadRanking) void loadRanking();
        if (canLoadChallenges) void loadChallenges();
      }, 200);
    };

    const handleI365SummaryRefresh = () => {
      triggerProgressReload();
    };
    window.addEventListener('i365:summary-refresh', handleI365SummaryRefresh);

    const progressChannel = supabase
      .channel(`user-progress-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_gamification', filter: `user_id=eq.${userId}` },
        triggerProgressReload,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_activities', filter: `user_id=eq.${userId}` },
        triggerProgressReload,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_achievements', filter: `user_id=eq.${userId}` },
        triggerProgressReload,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'learning_paths', filter: `user_id=eq.${userId}` },
        triggerEnrollmentReload,
      )
      .subscribe();

    // Social feed realtime
    const feedChannel = canLoadFeed
      ? supabase
        .channel('social-feed-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'social_feed' },
          (payload) => {
            if (cancelled) return;
            const d = payload.new as {
              id?: string;
              type?: FeedItem['type'];
              title?: string;
              content?: string | null;
              created_at?: string;
              metadata?: unknown;
            };
            const metadata = d.metadata && typeof d.metadata === 'object'
              ? d.metadata as Record<string, unknown>
              : undefined;
            const metadataPublishedAt = pickFirstNonEmptyString(
              metadata?.published_at,
              metadata?.publishedAt,
            );
            useAppStore.getState().addFeedItem({
              id: typeof d.id === 'string' ? d.id : crypto.randomUUID(),
              type: d.type === 'news' || d.type === 'podcast' || d.type === 'achievement' || d.type === 'event' || d.type === 'challenge' || d.type === 'tip'
                ? d.type
                : 'tip',
              title: typeof d.title === 'string' && d.title.trim().length > 0 ? d.title : 'Actualización',
              content: typeof d.content === 'string' ? d.content : '',
              createdAt: metadataPublishedAt || d.created_at || new Date().toISOString(),
              metadata,
            });
          }
        )
        .subscribe()
      : null;

    // Live events realtime
    const liveEventsChannel = canLoadLiveCommunity
      ? supabase
        .channel('course-events-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'course_events' },
          triggerLiveEventsReload,
        )
        .subscribe()
      : null;

    const socialGamificationChannel = (canLoadRanking || canLoadChallenges)
      ? supabase
        .channel('social-gamification-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'course_challenges' },
          triggerSocialGamificationReload,
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'course_enrollments', filter: `user_id=eq.${userId}` },
          triggerSocialGamificationReload,
        )
        .subscribe()
      : null;

    // Presence for online count
    const presenceChannel = canLoadLiveCommunity
      ? supabase
        .channel('online-users', { config: { presence: { key: userId } } })
        .on('presence', { event: 'sync' }, () => {
          if (cancelled) return;
          const state = presenceChannel.presenceState();
          const totalConnections = Object.values(state).reduce((total, entries) => {
            if (!Array.isArray(entries)) return total;
            return total + entries.length;
          }, 0);
          const fallbackUniqueUsers = Object.keys(state).length;
          setOnlineCount(totalConnections > 0 ? totalConnections : fallbackUniqueUsers);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel.track({ user_id: userId, online_at: new Date().toISOString() });
          }
        })
      : null;

    if (!canLoadLiveCommunity) {
      setOnlineCount(0);
    }

    const socialStatsRefreshInterval = (canLoadRanking || canLoadChallenges)
      ? setInterval(() => {
        if (cancelled) return;
        if (canLoadRanking) void loadRanking();
        if (canLoadChallenges) void loadChallenges();
      }, 60_000)
      : null;
    const billingSummaryRefreshInterval = billingBypassed
      ? null
      : setInterval(() => {
        if (cancelled) return;
        void loadProgress();
      }, 90_000);

    return () => {
      cancelled = true;
      if (progressReloadTimer) clearTimeout(progressReloadTimer);
      if (enrollmentReloadTimer) clearTimeout(enrollmentReloadTimer);
      if (liveEventsReloadTimer) clearTimeout(liveEventsReloadTimer);
      if (socialGamificationReloadTimer) clearTimeout(socialGamificationReloadTimer);
      if (socialStatsRefreshInterval) clearInterval(socialStatsRefreshInterval);
      if (billingSummaryRefreshInterval) clearInterval(billingSummaryRefreshInterval);
      window.removeEventListener('i365:summary-refresh', handleI365SummaryRefresh);
      supabase.removeChannel(progressChannel);
      if (feedChannel) supabase.removeChannel(feedChannel);
      if (liveEventsChannel) supabase.removeChannel(liveEventsChannel);
      if (socialGamificationChannel) supabase.removeChannel(socialGamificationChannel);
      if (presenceChannel) supabase.removeChannel(presenceChannel);
    };
  }, [billingAccessReady, billingBypassed, currentUserView.canSeeChallenges, currentUserView.canSeeCuratedNews, currentUserView.canSeeLeaderboard, currentUserView.canSeeLiveCommunity, effectiveOrgId, loadI365Summary, socialPolicyKey, userId]);
}
