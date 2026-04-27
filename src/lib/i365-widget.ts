import { loadExternalScript } from "@/lib/loadExternalScript";

const DEFAULT_I365_WIDGET_URL =
  "https://widget-i365-pagos-574077189410.us-central1.run.app/widget.js";

export type I365WidgetRole = "usuario" | "admin" | "superadmin";

export type I365WidgetSuccessPayload = {
  reference?: string;
  status?: string;
  transaction?: Record<string, unknown>;
  wompiResult?: Record<string, unknown>;
};

export type I365WidgetConfig = {
  appId: string;
  userId?: string;
  companyId?: string;
  userEmail?: string;
  userName?: string;
  role?: I365WidgetRole;
  planId?: string;
  redirectUrl?: string;
  onSuccess?: (data: I365WidgetSuccessPayload) => void;
  onError?: (error: { message?: string } | Error) => void;
  onClose?: () => void;
};

type I365WidgetApi = {
  open: (config: I365WidgetConfig) => void;
  close?: () => void;
  check?: (payload: Record<string, unknown>) => Promise<unknown>;
  consume?: (payload: Record<string, unknown>) => Promise<unknown>;
  summary?: (payload: Record<string, unknown>) => Promise<unknown>;
  activateFree?: (payload: Record<string, unknown>) => Promise<unknown>;
};

declare global {
  interface Window {
    PasarelaI365?: I365WidgetApi;
  }
}

export function getI365WidgetScriptUrl() {
  return import.meta.env.VITE_I365_WIDGET_URL || DEFAULT_I365_WIDGET_URL;
}

export async function loadI365PaymentWidget(scriptUrl = getI365WidgetScriptUrl()) {
  await loadExternalScript(scriptUrl, {
    id: "i365-widget-script",
    readyCheck: () => typeof window.PasarelaI365?.open === "function",
    timeoutMs: 15000,
  });

  if (!window.PasarelaI365) {
    throw new Error("El widget de pagos i365 cargó, pero PasarelaI365 no quedó disponible.");
  }

  return window.PasarelaI365;
}

export async function openI365PaymentWidget(config: I365WidgetConfig) {
  if (!config.appId.trim()) {
    throw new Error("Falta el appId del widget i365.");
  }

  const widget = await loadI365PaymentWidget();
  widget.open(config);
  return widget;
}
