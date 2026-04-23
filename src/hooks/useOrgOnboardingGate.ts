import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveOrgOnboardingGate } from '@/lib/org-onboarding';
import { useAppStore } from '@/stores/useAppStore';

export function useOrgOnboardingGate() {
  const { user } = useAuth();
  const activeOrgId = useAppStore((s) => s.activeOrgId);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const setOrgOnboardingGateLoading = useAppStore((s) => s.setOrgOnboardingGateLoading);
  const setOrgOnboardingGate = useAppStore((s) => s.setOrgOnboardingGate);

  const reload = useCallback(async () => {
    if (!user?.id || !activeOrgId || !onboardingCompleted) {
      setOrgOnboardingGate(null);
      setOrgOnboardingGateLoading(false);
      return;
    }

    setOrgOnboardingGateLoading(true);
    try {
      const gate = await resolveOrgOnboardingGate(user.id, activeOrgId);
      setOrgOnboardingGate(gate);
    } catch (error) {
      console.error('[useOrgOnboardingGate] Failed to resolve gate:', error);
      setOrgOnboardingGate(null);
    } finally {
      setOrgOnboardingGateLoading(false);
    }
  }, [
    activeOrgId,
    onboardingCompleted,
    setOrgOnboardingGate,
    setOrgOnboardingGateLoading,
    user?.id,
  ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const handleReload = () => {
      void reload();
    };

    window.addEventListener('org-context:reload', handleReload);
    return () => {
      window.removeEventListener('org-context:reload', handleReload);
    };
  }, [reload]);

  return { reload };
}
