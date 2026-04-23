import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  type OrgAnalyticsRouteInventoryRow,
  type OrgAnalyticsSort,
  type OrgAnalyticsSummary,
  type OrgAnalyticsTrendPoint,
  type OrgAnalyticsUserRouteRow,
  type OrgAnalyticsUserRow,
  type OrgAnalyticsWindowDays,
  getOrgAnalyticsErrorMessage,
  mapOrgAnalyticsRouteInventoryRow,
  mapOrgAnalyticsSummary,
  mapOrgAnalyticsTrendPoint,
  mapOrgAnalyticsUserRouteRow,
  mapOrgAnalyticsUserRow,
} from '@/lib/org-analytics';

interface UseOrgAdminAnalyticsOptions {
  orgId: string | null;
  enabled?: boolean;
}

export function useOrgAdminAnalytics({
  orgId,
  enabled = true,
}: UseOrgAdminAnalyticsOptions) {
  const [windowDays, setWindowDays] = useState<OrgAnalyticsWindowDays>(30);
  const [sort, setSort] = useState<OrgAnalyticsSort>('usage');
  const [summary, setSummary] = useState<OrgAnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<OrgAnalyticsTrendPoint[]>([]);
  const [users, setUsers] = useState<OrgAnalyticsUserRow[]>([]);
  const [routeInventory, setRouteInventory] = useState<OrgAnalyticsRouteInventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<OrgAnalyticsUserRow | null>(null);
  const [userRouteDetails, setUserRouteDetails] = useState<OrgAnalyticsUserRouteRow[]>([]);
  const [routeDetailsLoading, setRouteDetailsLoading] = useState(false);
  const [routeDetailsError, setRouteDetailsError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const routeDetailsRequestIdRef = useRef(0);

  const loadAnalytics = useCallback(async () => {
    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;

    if (!enabled || !orgId) {
      setSummary(null);
      setTrends([]);
      setUsers([]);
      setRouteInventory([]);
      setSelectedUser(null);
      setUserRouteDetails([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        summaryResult,
        trendsResult,
        usersResult,
        routeInventoryResult,
      ] = await Promise.all([
        supabase.rpc('get_org_admin_analytics_summary' as never, {
          p_org_id: orgId,
          p_window_days: windowDays,
        } as never),
        supabase.rpc('get_org_admin_analytics_trends' as never, {
          p_org_id: orgId,
          p_window_days: windowDays,
        } as never),
        supabase.rpc('get_org_admin_analytics_users' as never, {
          p_org_id: orgId,
          p_window_days: windowDays,
          p_sort: sort,
        } as never),
        supabase.rpc('get_org_admin_route_inventory' as never, {
          p_org_id: orgId,
        } as never),
      ]);

      if (summaryResult.error) throw summaryResult.error;
      if (trendsResult.error) throw trendsResult.error;
      if (usersResult.error) throw usersResult.error;
      if (routeInventoryResult.error) throw routeInventoryResult.error;

      if (requestIdRef.current !== currentRequestId) return;

      const summaryRow = Array.isArray(summaryResult.data)
        ? summaryResult.data[0]
        : summaryResult.data;

      setSummary(summaryRow ? mapOrgAnalyticsSummary(summaryRow) : null);
      setTrends(Array.isArray(trendsResult.data) ? trendsResult.data.map(mapOrgAnalyticsTrendPoint) : []);
      setUsers(Array.isArray(usersResult.data) ? usersResult.data.map(mapOrgAnalyticsUserRow) : []);
      setRouteInventory(
        Array.isArray(routeInventoryResult.data)
          ? routeInventoryResult.data.map(mapOrgAnalyticsRouteInventoryRow)
          : [],
      );
    } catch (loadError) {
      if (requestIdRef.current !== currentRequestId) return;
      setSummary(null);
      setTrends([]);
      setUsers([]);
      setRouteInventory([]);
      setError(getOrgAnalyticsErrorMessage(loadError, 'No pude cargar la analítica de la organización.'));
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, [enabled, orgId, sort, windowDays]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    setSelectedUser(null);
    setUserRouteDetails([]);
    setRouteDetailsError(null);
    setRouteDetailsLoading(false);
  }, [orgId]);

  const openUserDetails = useCallback(async (user: OrgAnalyticsUserRow) => {
    if (!orgId) return;

    const currentRequestId = routeDetailsRequestIdRef.current + 1;
    routeDetailsRequestIdRef.current = currentRequestId;
    setSelectedUser(user);
    setRouteDetailsLoading(true);
    setRouteDetailsError(null);

    try {
      const { data, error: routeDetailsRpcError } = await supabase.rpc('get_org_admin_user_route_details' as never, {
        p_org_id: orgId,
        p_user_id: user.userId,
      } as never);

      if (routeDetailsRpcError) throw routeDetailsRpcError;
      if (routeDetailsRequestIdRef.current !== currentRequestId) return;

      setUserRouteDetails(Array.isArray(data) ? data.map(mapOrgAnalyticsUserRouteRow) : []);
    } catch (detailsError) {
      if (routeDetailsRequestIdRef.current !== currentRequestId) return;
      setUserRouteDetails([]);
      setRouteDetailsError(getOrgAnalyticsErrorMessage(detailsError, 'No pude cargar las rutas de este usuario.'));
    } finally {
      if (routeDetailsRequestIdRef.current === currentRequestId) {
        setRouteDetailsLoading(false);
      }
    }
  }, [orgId]);

  const closeUserDetails = useCallback(() => {
    setSelectedUser(null);
    setUserRouteDetails([]);
    setRouteDetailsError(null);
    setRouteDetailsLoading(false);
  }, []);

  return {
    windowDays,
    setWindowDays,
    sort,
    setSort,
    summary,
    trends,
    users,
    routeInventory,
    loading,
    error,
    reload: loadAnalytics,
    selectedUser,
    userRouteDetails,
    routeDetailsLoading,
    routeDetailsError,
    openUserDetails,
    closeUserDetails,
  };
}
