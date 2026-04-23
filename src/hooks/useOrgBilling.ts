import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type OrgBillingWindowDays = 7 | 30 | 90;

export interface OrgBillingSummary {
  activeMembers: number;
  impactedUsers: number;
  transactionCount: number;
  creditsDebited: number;
  companyCreditsDebited: number;
  personalCreditsDebited: number;
  lastTransactionAt: string | null;
}

export interface OrgBillingTransactionRow {
  transactionId: string;
  createdAt: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  amount: number;
  reason: string;
  usageRef: string | null;
  i365ContextUsed: string | null;
  creditsConsumed: number;
  threadId: string | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function asNullableText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.trim()) return record.message.trim();
  }
  return fallback;
}

function mapSummary(value: unknown): OrgBillingSummary {
  const record = asRecord(value);
  return {
    activeMembers: asNumber(record.active_members),
    impactedUsers: asNumber(record.impacted_users),
    transactionCount: asNumber(record.transaction_count),
    creditsDebited: asNumber(record.credits_debited),
    companyCreditsDebited: asNumber(record.company_credits_debited),
    personalCreditsDebited: asNumber(record.personal_credits_debited),
    lastTransactionAt: asNullableText(record.last_transaction_at),
  };
}

function mapTransaction(value: unknown): OrgBillingTransactionRow {
  const record = asRecord(value);
  return {
    transactionId: asNullableText(record.transaction_id) ?? '',
    createdAt: asNullableText(record.created_at) ?? '',
    userId: asNullableText(record.user_id) ?? '',
    fullName: asNullableText(record.full_name),
    email: asNullableText(record.email),
    amount: asNumber(record.amount),
    reason: asNullableText(record.reason) ?? 'mentor_chat_usage',
    usageRef: asNullableText(record.usage_ref),
    i365ContextUsed: asNullableText(record.i365_context_used),
    creditsConsumed: asNumber(record.credits_consumed),
    threadId: asNullableText(record.thread_id),
  };
}

interface UseOrgBillingOptions {
  orgId: string | null;
  enabled?: boolean;
}

export function useOrgBilling({ orgId, enabled = true }: UseOrgBillingOptions) {
  const [windowDays, setWindowDays] = useState<OrgBillingWindowDays>(30);
  const [summary, setSummary] = useState<OrgBillingSummary | null>(null);
  const [transactions, setTransactions] = useState<OrgBillingTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!enabled || !orgId) {
      setSummary(null);
      setTransactions([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [summaryResult, transactionsResult] = await Promise.all([
        supabase.rpc('get_org_billing_summary' as never, {
          p_org_id: orgId,
          p_window_days: windowDays,
        } as never),
        supabase.rpc('get_org_billing_transactions' as never, {
          p_org_id: orgId,
          p_window_days: windowDays,
          p_limit: 100,
        } as never),
      ]);

      if (summaryResult.error) throw summaryResult.error;
      if (transactionsResult.error) throw transactionsResult.error;
      if (requestIdRef.current !== requestId) return;

      const summaryRow = Array.isArray(summaryResult.data) ? summaryResult.data[0] : summaryResult.data;
      setSummary(summaryRow ? mapSummary(summaryRow) : null);
      setTransactions(Array.isArray(transactionsResult.data) ? transactionsResult.data.map(mapTransaction) : []);
    } catch (loadError) {
      if (requestIdRef.current !== requestId) return;
      setSummary(null);
      setTransactions([]);
      setError(getErrorMessage(loadError, 'No pude cargar la facturación de la organización.'));
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [enabled, orgId, windowDays]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    windowDays,
    setWindowDays,
    summary,
    transactions,
    loading,
    error,
    reload: load,
  };
}
