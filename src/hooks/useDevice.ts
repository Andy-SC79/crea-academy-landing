import * as React from "react";

const MOBILE_MAX_WIDTH = 767;
const TABLET_MAX_WIDTH = 1023;
const MOBILE_QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`;
const TABLET_QUERY = `(min-width: ${MOBILE_MAX_WIDTH + 1}px) and (max-width: ${TABLET_MAX_WIDTH}px)`;
const DESKTOP_QUERY = `(min-width: ${TABLET_MAX_WIDTH + 1}px)`;

const MOBILE_UA_PATTERN = /mobi|iphone|ipod|android.*mobile|windows phone/i;
const TABLET_UA_PATTERN = /ipad|tablet|playbook|silk|kindle|nexus 7|nexus 9|nexus 10|sm-t/i;

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

function toDeviceInfo(type: DeviceType): DeviceInfo {
  return {
    type,
    isMobile: type === "mobile",
    isTablet: type === "tablet",
    isDesktop: type === "desktop",
  };
}

function getDeviceTypeFromUserAgent(userAgent: string): DeviceType | null {
  if (TABLET_UA_PATTERN.test(userAgent)) return "tablet";
  if (/macintosh/i.test(userAgent) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1) {
    return "tablet";
  }
  if (MOBILE_UA_PATTERN.test(userAgent)) return "mobile";
  if (/android/i.test(userAgent) && !/mobile/i.test(userAgent)) return "tablet";
  return null;
}

function detectDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";

  const userAgentType = getDeviceTypeFromUserAgent(window.navigator.userAgent);
  if (userAgentType) return userAgentType;

  if (window.matchMedia(MOBILE_QUERY).matches) return "mobile";
  if (window.matchMedia(TABLET_QUERY).matches) return "tablet";
  if (window.matchMedia(DESKTOP_QUERY).matches) return "desktop";

  return "desktop";
}

function addMediaListener(mql: MediaQueryList, listener: () => void) {
  if ("addEventListener" in mql) {
    mql.addEventListener("change", listener);
    return;
  }
  mql.addListener(listener);
}

function removeMediaListener(mql: MediaQueryList, listener: () => void) {
  if ("removeEventListener" in mql) {
    mql.removeEventListener("change", listener);
    return;
  }
  mql.removeListener(listener);
}

export function useDevice(): DeviceInfo {
  const [device, setDevice] = React.useState<DeviceInfo>(() => toDeviceInfo(detectDeviceType()));

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueries = [
      window.matchMedia(MOBILE_QUERY),
      window.matchMedia(TABLET_QUERY),
      window.matchMedia(DESKTOP_QUERY),
    ];

    const updateDevice = () => {
      setDevice(toDeviceInfo(detectDeviceType()));
    };

    mediaQueries.forEach((mql) => addMediaListener(mql, updateDevice));
    window.addEventListener("resize", updateDevice);
    updateDevice();

    return () => {
      mediaQueries.forEach((mql) => removeMediaListener(mql, updateDevice));
      window.removeEventListener("resize", updateDevice);
    };
  }, []);

  return device;
}
