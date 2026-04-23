import { useEffect, useState } from "react";
import {
  loadExternalScript,
  type ExternalScriptStatus,
} from "@/lib/loadExternalScript";

type UseExternalScriptOptions = Parameters<typeof loadExternalScript>[1] & {
  enabled?: boolean;
};

export function useExternalScript(
  src: string | null | undefined,
  options: UseExternalScriptOptions = {},
): ExternalScriptStatus {
  const { enabled = true, ...loadOptions } = options;
  const [status, setStatus] = useState<ExternalScriptStatus>(
    enabled && src ? "loading" : "idle",
  );

  useEffect(() => {
    if (!enabled || !src) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    loadExternalScript(src, loadOptions)
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, loadOptions, src]);

  return status;
}

