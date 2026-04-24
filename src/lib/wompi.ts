import { loadExternalScript } from "@/lib/loadExternalScript";

type WompiCheckoutResult = {
  transaction?: {
    id?: string;
    reference?: string;
    status?: string;
    status_message?: string;
  };
};

type WompiCheckout = {
  open: (callback?: (result: WompiCheckoutResult) => void) => void;
};

type WompiCheckoutConstructor = new (config: Record<string, unknown>) => WompiCheckout;

declare global {
  interface Window {
    WidgetCheckout?: WompiCheckoutConstructor;
  }
}

const WOMPI_SCRIPT_URL = "https://checkout.wompi.co/widget.js";

export async function loadWompiCheckout() {
  await loadExternalScript(WOMPI_SCRIPT_URL, {
    id: "wompi-script",
    readyCheck: () => typeof window.WidgetCheckout === "function",
    timeoutMs: 15000,
  });

  if (!window.WidgetCheckout) {
    throw new Error("El portal de pagos i365 cargó, pero el checkout no quedó disponible.");
  }

  return window.WidgetCheckout;
}
