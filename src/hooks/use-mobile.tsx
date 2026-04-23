import { useDevice } from "@/hooks/useDevice";

export function useIsMobile() {
  const { isMobile } = useDevice();
  return isMobile;
}
