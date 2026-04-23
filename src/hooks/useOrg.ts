/**
 * ═══════════════════════════════════════════════════════════
 * useOrg — Organization hook for Enterprise Module
 * ═══════════════════════════════════════════════════════════
 *
 * Provides the current user's active organization context.
 * Reads memberships from Supabase and derives active org.
 *
 * FIX: separated data-fetch from auto-select to prevent
 * infinite re-render loops (activeOrgId was both a dep AND
 * mutated inside the same callback).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/stores/useAppStore';
import type { Organization, OrgMembership, OrgRole } from '@/lib/org-types';

export function useOrg() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const activeOrgId = useAppStore((s) => s.activeOrgId);
  const setActiveOrgId = useAppStore((s) => s.setActiveOrgId);
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  const persistActiveOrgId = useCallback(async (orgId: string | null) => {
    if (!userId) return;

    const { error } = await supabase
      .from('user_ui_preferences')
      .upsert(
        ({
          user_id: userId,
          active_org_id: orgId,
        }) as never,
        { onConflict: 'user_id' },
      );

    if (error) {
      console.error('Error persisting active org preference:', error.message);
    }
  }, [userId]);

  // ─── Load memberships (depends only on user) ──────────
  const loadMemberships = useCallback(async () => {
    if (!userId) {
      setMemberships([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [
        membershipsResult,
        preferencesResult,
      ] = await Promise.all([
        supabase
          .from('org_memberships')
          .select('*, organizations(*)')
          .eq('user_id', userId)
          .eq('is_active', true),
        supabase
          .from('user_ui_preferences')
          .select('active_org_id')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      if (membershipsResult.error) {
        console.error('Error loading org memberships:', membershipsResult.error.message);
        setLoading(false);
        return;
      }

      const nextMemberships = (membershipsResult.data ?? []) as unknown as OrgMembership[];
      const validOrgIds = new Set(nextMemberships.map((membership) => membership.org_id));
      const storedActiveOrgId = typeof preferencesResult.data?.active_org_id === 'string'
        ? preferencesResult.data.active_org_id
        : null;
      const currentActiveOrgId = useAppStore.getState().activeOrgId;

      let resolvedActiveOrgId: string | null = null;
      if (storedActiveOrgId && validOrgIds.has(storedActiveOrgId)) {
        resolvedActiveOrgId = storedActiveOrgId;
      } else if (currentActiveOrgId && validOrgIds.has(currentActiveOrgId)) {
        resolvedActiveOrgId = currentActiveOrgId;
      } else {
        resolvedActiveOrgId = nextMemberships[0]?.org_id ?? null;
      }

      setMemberships(nextMemberships);

      if (currentActiveOrgId !== resolvedActiveOrgId) {
        setActiveOrgId(resolvedActiveOrgId);
      }

      if (storedActiveOrgId !== resolvedActiveOrgId) {
        void persistActiveOrgId(resolvedActiveOrgId);
      }
    } catch (err) {
      console.error('Failed to load org memberships:', err);
    } finally {
      setLoading(false);
    }
  }, [persistActiveOrgId, setActiveOrgId, userId]);

  // Fetch once when user changes
  useEffect(() => {
    fetchedRef.current = false;
    loadMemberships();
  }, [loadMemberships]);

  useEffect(() => {
    const handleReload = () => {
      void loadMemberships();
    };

    window.addEventListener('org-context:reload', handleReload);
    return () => {
      window.removeEventListener('org-context:reload', handleReload);
    };
  }, [loadMemberships]);

  // ─── Auto-select first org if none active (one-shot) ──
  useEffect(() => {
    if (fetchedRef.current) return;
    const hasValidActiveOrg = memberships.some((membership) => membership.org_id === activeOrgId);
    if (memberships.length > 0 && (!activeOrgId || !hasValidActiveOrg)) {
      setActiveOrgId(memberships[0].org_id);
      fetchedRef.current = true;
    }
  }, [memberships, activeOrgId, setActiveOrgId]);

  // ─── Derived state from memberships + activeOrgId ─────
  const activeMembership = useMemo(
    () => memberships.find((m) => m.org_id === activeOrgId) ?? null,
    [memberships, activeOrgId]
  );

  const activeOrg: Organization | null = activeMembership?.organizations ?? null;
  const orgRole: OrgRole | null = activeMembership?.role ?? null;
  const canManageMembers = orgRole === 'owner' || orgRole === 'admin';
  const canManageOrgRoles = orgRole === 'owner' || orgRole === 'admin';
  const canEditOrg = orgRole === 'owner' || orgRole === 'admin';
  const canEditOrgOnboarding = orgRole === 'owner' || orgRole === 'admin';

  const switchOrg = useCallback(
    (orgId: string) => {
      useAppStore.getState().setOrgOnboardingGateLoading(true);
      useAppStore.getState().setOrgOnboardingGate(null);
      setActiveOrgId(orgId);
      void persistActiveOrgId(orgId);
    },
    [persistActiveOrgId, setActiveOrgId]
  );

  return {
    activeOrg,
    activeOrgId,
    orgRole,
    memberships,
    organizations: memberships
      .map((m) => m.organizations)
      .filter(Boolean) as Organization[],
    isOrgOwner: orgRole === 'owner',
    isOrgAdmin: orgRole === 'owner' || orgRole === 'admin',
    isOrgInstructor: orgRole === 'instructor',
    isOrgAuthor: orgRole === 'owner' || orgRole === 'admin' || orgRole === 'instructor',
    isOrgMember: orgRole != null,
    canManageMembers,
    canManageOrgRoles,
    canEditOrg,
    canEditOrgOnboarding,
    hasOrg: memberships.length > 0,
    switchOrg,
    reload: loadMemberships,
    loading,
  };
}
