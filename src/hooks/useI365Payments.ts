import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrg } from '@/hooks/useOrg';
import { useRoles } from '@/hooks/useRoles';
import {
  I365_PAYMENTS_APP_ID,
  I365_REASON_MESSAGES,
  loadI365PaymentsWidget,
  type I365CheckPayload,
  type I365ConsumePayload,
  type I365OpenConfig,
  type I365Role,
  type I365SummaryPayload,
} from '@/lib/i365-payments';
import { invokeEnsureI365FreePlan } from '@/lib/i365-free-plan';

function resolveRole(isSuperAdmin: boolean, isOrgAdmin: boolean): I365Role {
  if (isSuperAdmin) return 'superadmin';
  if (isOrgAdmin) return 'admin';
  return 'usuario';
}

export function useI365Payments() {
  const { user } = useAuth();
  const { activeOrg, isOrgAdmin } = useOrg();
  const { isSuperAdmin } = useRoles();

  const buildBasePayload = useCallback(() => {
    if (!user?.id || !user.email) {
      throw new Error('Debes iniciar sesión para usar la pasarela i365.');
    }

    return {
      appId: I365_PAYMENTS_APP_ID,
      app_id: I365_PAYMENTS_APP_ID,
      userId: user.id,
      user_id: user.id,
      userEmail: user.email.trim().toLowerCase(),
      user_email: user.email.trim().toLowerCase(),
      userName: (() => {
        const metadata = user.user_metadata as Record<string, unknown> | undefined;
        if (typeof metadata?.full_name === 'string' && metadata.full_name.trim()) return metadata.full_name.trim();
        if (typeof metadata?.name === 'string' && metadata.name.trim()) return metadata.name.trim();
        return undefined;
      })(),
      companyId: activeOrg?.id,
      company_id: activeOrg?.id,
      role: resolveRole(isSuperAdmin, isOrgAdmin),
    };
  }, [activeOrg?.id, isOrgAdmin, isSuperAdmin, user]);

  const open = useCallback(async (config: Omit<I365OpenConfig, 'appId' | 'userId' | 'userEmail' | 'companyId' | 'userName' | 'role'> = {}) => {
    const widget = await loadI365PaymentsWidget();
    const payload = buildBasePayload();
    widget.open({
      appId: payload.appId,
      userId: payload.userId,
      userEmail: payload.userEmail,
      userName: payload.userName,
      role: payload.role,
      ...(payload.companyId ? { companyId: payload.companyId } : {}),
      ...config,
    });
  }, [buildBasePayload]);

  const check = useCallback(async (payload: Omit<I365CheckPayload, 'app_id' | 'user_id' | 'company_id'> = {}) => {
    const widget = await loadI365PaymentsWidget();
    const base = buildBasePayload();
    return widget.check({
      app_id: base.app_id,
      user_id: base.user_id,
      ...(base.company_id ? { company_id: base.company_id } : {}),
      ...payload,
    });
  }, [buildBasePayload]);

  const consume = useCallback(async (payload: Omit<I365ConsumePayload, 'app_id' | 'user_id' | 'company_id'>) => {
    const widget = await loadI365PaymentsWidget();
    const base = buildBasePayload();
    return widget.consume({
      app_id: base.app_id,
      user_id: base.user_id,
      ...(base.company_id ? { company_id: base.company_id } : {}),
      ...payload,
    });
  }, [buildBasePayload]);

  const summary = useCallback(async (payload: Omit<I365SummaryPayload, 'app_id' | 'user_id' | 'company_id'> = {}) => {
    const widget = await loadI365PaymentsWidget();
    const base = buildBasePayload();
    return widget.summary({
      app_id: base.app_id,
      user_id: base.user_id,
      ...(base.company_id ? { company_id: base.company_id } : {}),
      ...payload,
    });
  }, [buildBasePayload]);

  const activateFree = useCallback(async () => {
    const base = buildBasePayload();
    return invokeEnsureI365FreePlan({
      triggerSource: 'session_restore',
      companyId: base.company_id ?? null,
    });
  }, [buildBasePayload]);

  return {
    appId: I365_PAYMENTS_APP_ID,
    companyId: activeOrg?.id ?? null,
    reasonMessages: I365_REASON_MESSAGES,
    loadWidget: loadI365PaymentsWidget,
    open,
    check,
    consume,
    summary,
    activateFree,
  };
}
