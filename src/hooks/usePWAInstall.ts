import { useCallback, useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "crea:pwa-install-dismissed";

function getIsStandalone() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getIsIOS() {
  if (typeof navigator === "undefined") return false;

  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function getIsMobileDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const nav = navigator as Navigator & {
    userAgentData?: {
      mobile?: boolean;
    };
  };

  if (nav.userAgentData?.mobile) return true;

  if (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(
      navigator.userAgent,
    )
  ) {
    return true;
  }

  const hasCoarsePointer =
    window.matchMedia?.("(pointer: coarse)")?.matches === true ||
    window.matchMedia?.("(hover: none)")?.matches === true;
  const hasMobileViewport = window.matchMedia?.("(max-width: 1023px)")?.matches === true;

  return hasCoarsePointer && hasMobileViewport;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(getIsStandalone);
  const [isMobileDevice, setIsMobileDevice] = useState(getIsMobileDevice);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(DISMISS_KEY) === "true";
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      if (!getIsMobileDevice()) {
        return;
      }

      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(display-mode: standalone)");
    if (!mediaQuery) return;

    const sync = () => setIsStandalone(getIsStandalone());
    mediaQuery.addEventListener("change", sync);
    sync();

    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const pointerQuery = window.matchMedia?.("(pointer: coarse)");
    const hoverQuery = window.matchMedia?.("(hover: none)");
    const viewportQuery = window.matchMedia?.("(max-width: 1023px)");
    const sync = () => setIsMobileDevice(getIsMobileDevice());

    window.addEventListener("resize", sync, { passive: true });
    pointerQuery?.addEventListener("change", sync);
    hoverQuery?.addEventListener("change", sync);
    viewportQuery?.addEventListener("change", sync);
    sync();

    return () => {
      window.removeEventListener("resize", sync);
      pointerQuery?.removeEventListener("change", sync);
      hoverQuery?.removeEventListener("change", sync);
      viewportQuery?.removeEventListener("change", sync);
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    window.localStorage.setItem(DISMISS_KEY, "true");
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      dismiss();
      return true;
    }

    return false;
  }, [deferredPrompt, dismiss]);

  const isIOS = useMemo(getIsIOS, []);
  const canInstall = Boolean(deferredPrompt) && !dismissed && !isStandalone;
  const showIOSHint = isIOS && !dismissed && !isStandalone;

  return {
    canInstall,
    dismiss,
    install,
    isIOS,
    isMobileDevice,
    isStandalone,
    showIOSHint,
  };
}
