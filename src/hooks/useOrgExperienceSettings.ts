import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrg } from '@/hooks/useOrg';
import { useRoles } from '@/hooks/useRoles';
import type { OrgRole } from '@/lib/org-types';
import {
  deriveOrgExperiencePolicyView,
  normalizeOrgExperienceSettings,
  type OrgExperiencePolicyView,
  type OrgMemberExperienceSettings,
} from '@/lib/org-experience';

type OrgExperienceHookOptions = {
  orgIdOverride?: string | null;
  orgRoleOverride?: OrgRole | null;
};

type OrgExperienceHookResult = {
  settings: OrgMemberExperienceSettings | null;
  loading: boolean;
  reload: () => Promise<void>;
  effectiveOrgId: string | null;
  isBypassedForCurrentUser: boolean;
  memberView: OrgExperiencePolicyView;
  currentUserView: OrgExperiencePolicyView;
};

const OPEN_MEMBER_VIEW: OrgExperiencePolicyView = {
  canBrowseOrgRouteCatalog: true,
  canCreatePersonalPaths: true,
  canSeeCuratedNews: true,
  canSeeGlobalRouteLibrary: true,
  canUseExternalNews: true,
  canUseMentorChat: true,
  canUseMentorVoiceTools: true,
  canUseMentorVisualTools: true,
  canSeeMentorHistory: true,
  canSeeLiveCommunity: true,
  canSeeLeaderboard: true,
  canSeeChallenges: true,
  hasAnyRightPanelContent: true,
};

function isBypassedOrgRole(role: OrgRole | null | undefined): boolean {
  return role === 'owner' || role === 'admin' || role === 'instructor';
}

export function useOrgExperienceSettings(
  options: OrgExperienceHookOptions = {},
): OrgExperienceHookResult {
  const { activeOrgId, orgRole } = useOrg();
  const { isSuperAdmin } = useRoles();
  const effectiveOrgId = options.orgIdOverride ?? activeOrgId;
  const effectiveOrgRole = options.orgRoleOverride ?? orgRole;
  const [settings, setSettings] = useState<OrgMemberExperienceSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    if (!effectiveOrgId) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('org_member_experience_settings' as never)
        .select('*')
        .eq('org_id', effectiveOrgId)
        .maybeSingle();

      if (error) {
        console.error('[useOrgExperienceSettings] load error', error);
        setSettings(normalizeOrgExperienceSettings(null, effectiveOrgId));
        return;
      }

      const row = (data ?? null) as Partial<OrgMemberExperienceSettings> | null;
      setSettings(normalizeOrgExperienceSettings(row, effectiveOrgId));
    } catch (error) {
      console.error('[useOrgExperienceSettings] unexpected error', error);
      setSettings(normalizeOrgExperienceSettings(null, effectiveOrgId));
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const reload = () => {
      void loadSettings();
    };

    window.addEventListener('org-experience:reload', reload);
    return () => window.removeEventListener('org-experience:reload', reload);
  }, [loadSettings]);

  const isBypassedForCurrentUser = isSuperAdmin || isBypassedOrgRole(effectiveOrgRole);
  const normalizedSettings = useMemo(() => {
    if (!effectiveOrgId) return null;
    return settings ?? normalizeOrgExperienceSettings(null, effectiveOrgId);
  }, [effectiveOrgId, settings]);

  const memberView = useMemo<OrgExperiencePolicyView>(() => {
    if (!normalizedSettings) return OPEN_MEMBER_VIEW;
    return deriveOrgExperiencePolicyView(normalizedSettings);
  }, [normalizedSettings]);

  const currentUserView = useMemo<OrgExperiencePolicyView>(() => {
    if (!normalizedSettings) return OPEN_MEMBER_VIEW;
    return deriveOrgExperiencePolicyView(normalizedSettings, { bypass: isBypassedForCurrentUser });
  }, [isBypassedForCurrentUser, normalizedSettings]);

  return {
    settings: normalizedSettings,
    loading,
    reload: loadSettings,
    effectiveOrgId,
    isBypassedForCurrentUser,
    memberView,
    currentUserView,
  };
}
