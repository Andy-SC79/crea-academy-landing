export type ExternalScriptStatus = "idle" | "loading" | "ready" | "error";

type LoadExternalScriptOptions = {
  id?: string;
  async?: boolean;
  defer?: boolean;
  crossOrigin?: HTMLScriptElement["crossOrigin"];
  timeoutMs?: number;
  readyCheck?: () => boolean;
  attributes?: Record<string, string>;
};

const registry = new Map<string, Promise<void>>();

function findExistingScript(src: string, id?: string): HTMLScriptElement | null {
  if (id) {
    const byId = document.getElementById(id);
    if (byId instanceof HTMLScriptElement) return byId;
  }

  return document.querySelector(`script[src="${src}"]`);
}

export function loadExternalScript(
  src: string,
  options: LoadExternalScriptOptions = {},
): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Los scripts externos solo están disponibles en el navegador."));
  }

  if (options.readyCheck?.()) {
    return Promise.resolve();
  }

  const existing = registry.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const finishIfReady = () => {
      if (options.readyCheck?.()) {
        resolve();
        return true;
      }

      return false;
    };

    if (finishIfReady()) return;

    const script = findExistingScript(src, options.id) ?? document.createElement("script");
    const needsAppend = !script.isConnected;
    let timeoutId: number | null = null;

    const cleanup = () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };

    const onLoad = () => {
      cleanup();
      script.dataset.loaded = "true";
      if (finishIfReady()) return;
      resolve();
    };

    const onError = () => {
      cleanup();
      registry.delete(src);
      reject(new Error(`No se pudo cargar el script externo: ${src}`));
    };

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    if (needsAppend) {
      if (options.id) script.id = options.id;
      script.src = src;
      script.async = options.async ?? true;
      script.defer = options.defer ?? false;
      if (options.crossOrigin) script.crossOrigin = options.crossOrigin;
      Object.entries(options.attributes ?? {}).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });
      document.body.appendChild(script);
    } else if (script.dataset.loaded === "true") {
      cleanup();
      if (finishIfReady()) return;
      resolve();
      return;
    }

    timeoutId = window.setTimeout(() => {
      if (finishIfReady()) {
        cleanup();
        return;
      }

      cleanup();
      registry.delete(src);
      reject(new Error(`Tiempo agotado cargando el script externo: ${src}`));
    }, options.timeoutMs ?? 15000);
  });

  registry.set(src, promise);
  return promise;
}
