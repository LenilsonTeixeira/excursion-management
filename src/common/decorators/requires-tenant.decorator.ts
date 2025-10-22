import { SetMetadata } from '@nestjs/common';

export const REQUIRES_TENANT_KEY = 'requiresTenant';

/**
 * Decorator to mark routes that require a tenant context
 * Use this on controllers/routes that need tenant resolution
 */
export const RequiresTenant = () => SetMetadata(REQUIRES_TENANT_KEY, true);

/**
 * Decorator to explicitly mark routes that don't need tenant
 * Useful for global/admin routes
 */
export const NoTenantRequired = () => SetMetadata(REQUIRES_TENANT_KEY, false);

