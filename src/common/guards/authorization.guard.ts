import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { REQUIRE_OWNERSHIP_KEY } from '../decorators/require-ownership.decorator';
import { REQUIRES_TENANT_KEY } from '../decorators/requires-tenant.decorator';
import { JwtPayload } from '../decorators/current-user.decorator';

/**
 * Authorization Guard with RBAC and Tenant Ownership
 *
 * Features:
 * - Validates user roles from JWT token
 * - Checks tenant ownership (user.tenantId === request.tenantId)
 * - Superadmin has global access (bypasses tenant checks)
 * - Works with @Roles() and @RequireOwnership() decorators
 */
@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    // If no user, let JwtAuthGuard handle it
    if (!user) {
      return true;
    }

    // Check if tenant is explicitly not required
    const requiresTenant = this.reflector.getAllAndOverride<boolean>(
      REQUIRES_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If explicitly set to false (@NoTenantRequired), skip tenant checks
    if (requiresTenant === false) {
      this.logger.debug(
        'Tenant not required for this route, skipping tenant checks',
      );
      return true;
    }

    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Get ownership requirement from decorator
    const requireOwnership = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 1. Check if user has required roles
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some((role) => user.role === role);

      if (!hasRole) {
        this.logger.warn(
          `Access denied: User ${user.email} (${user.role}) attempted to access route requiring roles: ${requiredRoles.join(', ')}`,
        );
        throw new ForbiddenException(
          `Access denied. Required roles: ${requiredRoles.join(' or ')}`,
        );
      }
    }

    // 2. Check tenant ownership (if required and not superadmin)
    if (requireOwnership && !this.isSuperAdmin(user)) {
      const requestTenantId = request.tenantId;

      // If route requires tenant but none is present
      if (!requestTenantId) {
        this.logger.warn(
          `Ownership check failed: No tenant in request for user ${user.email}`,
        );
        throw new ForbiddenException(
          'Tenant context required for this operation',
        );
      }

      // Check if user belongs to the same tenant
      if (!this.isSameTenant(user, requestTenantId)) {
        this.logger.warn(
          `Tenant ownership violation: User ${user.email} (tenant: ${user.tenantId}) attempted to access resources of tenant: ${requestTenantId}`,
        );
        throw new ForbiddenException(
          'Access denied. You can only access resources from your own agency.',
        );
      }

      this.logger.debug(
        `Ownership check passed: User ${user.email} accessing tenant ${requestTenantId}`,
      );
    }

    // 3. Log successful authorization
    this.logger.debug(
      `Authorization granted: User ${user.email} (${user.role}) - Tenant: ${user.tenantId || 'global'}`,
    );

    return true;
  }

  /**
   * Check if user is superadmin (global access)
   */
  private isSuperAdmin(user: JwtPayload): boolean {
    return user.role === 'superadmin';
  }

  /**
   * Check if user is agency admin
   */
  private isAgencyAdmin(user: JwtPayload): boolean {
    return user.role === 'agency_admin';
  }

  /**
   * Check if user belongs to the same tenant as the resource
   */
  private isSameTenant(user: JwtPayload, resourceTenantId: string): boolean {
    // Superadmin can access any tenant
    if (this.isSuperAdmin(user)) {
      return true;
    }

    // Check if user's tenant matches resource tenant
    return user.tenantId === resourceTenantId;
  }
}
