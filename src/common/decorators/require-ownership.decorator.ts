import { SetMetadata } from '@nestjs/common';

export const REQUIRE_OWNERSHIP_KEY = 'requireOwnership';

/**
 * Decorator to require tenant ownership validation
 *
 * When applied, the AuthorizationGuard will verify that:
 * - User's tenantId matches the request's tenantId
 * - Superadmin bypasses this check (global access)
 *
 * @example
 * ```typescript
 * @Controller('excursions')
 * @RequireOwnership()
 * export class ExcursionsController {
 *   // All routes here require tenant ownership
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Get(':id')
 * @RequireOwnership()
 * findOne(@Param('id') id: string) {
 *   // Only users from the same tenant can access
 * }
 * ```
 */
export const RequireOwnership = () => SetMetadata(REQUIRE_OWNERSHIP_KEY, true);
