import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type McpApiKeyRecord = Pick<
  Tables<'mcp_api_keys'>,
  'id' | 'name' | 'key_prefix' | 'is_active' | 'last_used_at' | 'created_at' | 'revoked_at'
>;

export type UserMcpSettingsRecord = Pick<
  Tables<'user_mcp_settings'>,
  'mcp_enabled' | 'chatgpt_oauth_enabled'
>;

type McpListResponse = {
  keys?: unknown;
  settings?: unknown;
  max_active_keys?: unknown;
  limits?: {
    max_active_keys?: unknown;
  } | null;
};

type McpCreateResponse = {
  key?: unknown;
  raw_key?: unknown;
  rawKey?: unknown;
};

type McpSetEnabledResponse = {
  settings?: unknown;
};

const DEFAULT_SETTINGS: UserMcpSettingsRecord = {
  mcp_enabled: false,
  chatgpt_oauth_enabled: false,
};

const DEFAULT_MAX_ACTIVE_KEYS = 5;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeSettings(value: unknown): UserMcpSettingsRecord {
  const record = asRecord(value);
  if (!record) return DEFAULT_SETTINGS;

  return {
    mcp_enabled: asBoolean(record.mcp_enabled) ?? DEFAULT_SETTINGS.mcp_enabled,
    chatgpt_oauth_enabled:
      asBoolean(record.chatgpt_oauth_enabled) ?? DEFAULT_SETTINGS.chatgpt_oauth_enabled,
  };
}

function normalizeKey(value: unknown): McpApiKeyRecord | null {
  const record = asRecord(value);
  if (!record) return null;

  const id = asString(record.id);
  const name = asString(record.name);
  const keyPrefix = asString(record.key_prefix);
  const createdAt = asString(record.created_at);

  if (!id || !name || !keyPrefix || !createdAt) return null;

  return {
    id,
    name,
    key_prefix: keyPrefix,
    is_active: asBoolean(record.is_active) ?? true,
    last_used_at: asString(record.last_used_at),
    created_at: createdAt,
    revoked_at: asString(record.revoked_at),
  };
}

function normalizeKeys(value: unknown): McpApiKeyRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(normalizeKey)
    .filter((item): item is McpApiKeyRecord => item !== null)
    .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at));
}

function normalizeMaxActiveKeys(value: unknown): number {
  return asNumber(value) ?? DEFAULT_MAX_ACTIVE_KEYS;
}

async function extractMessageAsync(error: unknown): Promise<string> {
  const record = asRecord(error);
  const context = record?.context;

  if (context instanceof Response) {
    const payload = await context.clone().json().catch(() => null) as Record<string, unknown> | null;
    const contextMessage =
      asString(payload?.message)
      ?? asString(payload?.error_description)
      ?? asString(payload?.error)
      ?? asString(payload?.details);

    if (contextMessage) return contextMessage;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }

  if (!record) return 'No pudimos completar la accion MCP.';

  const message =
    asString(record.message)
    ?? asString(record.error_description)
    ?? asString(record.error)
    ?? asString(record.details);

  return message ?? 'No pudimos completar la accion MCP.';
}

async function invokeMcpKeyManage<TResponse>(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke<TResponse>('mcp-key-manage', { body });
  if (error) throw error;
  return data;
}

export function useMcpKeys() {
  const { user, loading: authLoading } = useAuth();
  const [keys, setKeys] = useState<McpApiKeyRecord[]>([]);
  const [settings, setSettings] = useState<UserMcpSettingsRecord>(DEFAULT_SETTINGS);
  const [lastCreatedSecret, setLastCreatedSecret] = useState<string | null>(null);
  const [maxActiveKeys, setMaxActiveKeys] = useState<number>(DEFAULT_MAX_ACTIVE_KEYS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingEnabled, setUpdatingEnabled] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setKeys([]);
      setSettings(DEFAULT_SETTINGS);
      setMaxActiveKeys(DEFAULT_MAX_ACTIVE_KEYS);
      setError(null);
      setRefreshing(false);
      setLoading(false);
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const data = await invokeMcpKeyManage<McpListResponse>({ action: 'list' });
      setKeys(normalizeKeys(data?.keys));
      setSettings(normalizeSettings(data?.settings));
      setMaxActiveKeys(
        normalizeMaxActiveKeys(data?.limits?.max_active_keys ?? data?.max_active_keys),
      );
    } catch (nextError) {
      const message = await extractMessageAsync(nextError);
      setError(message);
      throw new Error(message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refresh().catch(() => undefined);
  }, [authLoading, refresh]);

  const createKey = useCallback(
    async (name: string) => {
      const normalizedName = name.trim();
      if (!normalizedName) {
        throw new Error('Necesitas un nombre para crear la clave.');
      }

      setCreating(true);
      setError(null);

      try {
        const data = await invokeMcpKeyManage<McpCreateResponse>({ action: 'create', name: normalizedName });
        const createdKey = normalizeKey(data?.key);
        const rawKey = asString(data?.raw_key) ?? asString(data?.rawKey);

        if (!rawKey) {
          throw new Error('La funcion respondio sin la clave secreta.');
        }

        if (createdKey) {
          setKeys((previous) =>
            [createdKey, ...previous.filter((item) => item.id !== createdKey.id)]
              .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at)),
          );
        } else {
          await refresh();
        }

        setLastCreatedSecret(rawKey);
        return { key: createdKey, rawKey };
      } catch (nextError) {
        const message = await extractMessageAsync(nextError);
        setError(message);
        throw new Error(message);
      } finally {
        setCreating(false);
      }
    },
    [refresh],
  );

  const revokeKey = useCallback(async (keyId: string) => {
    setRevokingKeyId(keyId);
    setError(null);

    try {
      await invokeMcpKeyManage({ action: 'revoke', key_id: keyId });
      setKeys((previous) =>
        previous.map((item) =>
          item.id === keyId
            ? {
                ...item,
                is_active: false,
                revoked_at: item.revoked_at ?? new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (nextError) {
      const message = await extractMessageAsync(nextError);
      setError(message);
      throw new Error(message);
    } finally {
      setRevokingKeyId(null);
    }
  }, []);

  const setEnabled = useCallback(async (enabled: boolean) => {
    setUpdatingEnabled(true);
    setError(null);

    try {
      const data = await invokeMcpKeyManage<McpSetEnabledResponse>({
        action: 'set_enabled',
        enabled,
      });
      setSettings((previous) => ({
        ...previous,
        ...normalizeSettings(data?.settings),
        mcp_enabled: enabled,
      }));
    } catch (nextError) {
      const message = await extractMessageAsync(nextError);
      setError(message);
      throw new Error(message);
    } finally {
      setUpdatingEnabled(false);
    }
  }, []);

  const setChatgptOauthEnabled = useCallback(async (enabled: boolean) => {
    if (!user) {
      throw new Error('Necesitas iniciar sesion para actualizar OAuth.');
    }

    setUpdatingEnabled(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('user_mcp_settings')
        .upsert(
          {
            user_id: user.id,
            chatgpt_oauth_enabled: enabled,
          },
          { onConflict: 'user_id' },
        )
        .select('mcp_enabled, chatgpt_oauth_enabled')
        .single();

      if (updateError || !data) {
        throw new Error(updateError?.message || 'No pudimos actualizar el estado OAuth.');
      }

      setSettings((previous) => ({
        ...previous,
        ...normalizeSettings(data),
        chatgpt_oauth_enabled: enabled,
      }));
    } catch (nextError) {
      const message = await extractMessageAsync(nextError);
      setError(message);
      throw new Error(message);
    } finally {
      setUpdatingEnabled(false);
    }
  }, [user]);

  const clearLastCreatedSecret = useCallback(() => {
    setLastCreatedSecret(null);
  }, []);

  const activeKeys = useMemo(() => keys.filter((item) => item.is_active), [keys]);
  const revokedKeys = useMemo(() => keys.filter((item) => !item.is_active), [keys]);
  const canCreateMoreKeys = activeKeys.length < maxActiveKeys;
  const busy = refreshing || creating || updatingEnabled || revokingKeyId !== null;

  return {
    keys,
    activeKeys,
    revokedKeys,
    settings,
    lastCreatedSecret,
    maxActiveKeys,
    canCreateMoreKeys,
    loading,
    refreshing,
    creating,
    updatingEnabled,
    revokingKeyId,
    busy,
    error,
    refresh,
    createKey,
    revokeKey,
    setEnabled,
    setChatgptOauthEnabled,
    clearLastCreatedSecret,
  };
}
