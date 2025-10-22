import { SetMetadata } from '@nestjs/common';

export const ALLOW_ROLES_KEY = 'allowRoles';

/**
 * Decorator to specify allowed roles (alias for @Roles)
 *
 * More semantic name when combined with ownership checks.
 * Uses the same metadata key as @Roles for compatibility.
 *
 * @param roles - Array of allowed roles
 *
 * @example
 * ```typescript
 * @Get()
 * @AllowRoles('agency_admin', 'agent')
 * @RequireOwnership()
 * findAll() {
 *   // Only agency_admin or agent from the same tenant
 * }
 * ```
 */
export const AllowRoles = (...roles: string[]) => SetMetadata('roles', roles);
