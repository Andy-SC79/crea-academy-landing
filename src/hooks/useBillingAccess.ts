import { useRoles } from '@/hooks/useRoles';

export function useBillingAccess() {
  const { isSuperAdmin, rolesLoaded } = useRoles();

  return {
    billingAccessReady: rolesLoaded,
    billingBypassed: isSuperAdmin,
    showsUnlimitedBilling: isSuperAdmin,
  };
}
