import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRES_TENANT_KEY } from '../decorators/requires-tenant.decorator';

/**
 * Guard to enforce tenant requirement on routes
 * Works with @RequiresTenant() decorator
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresTenant = this.reflector.getAllAndOverride<boolean>(
      REQUIRES_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If decorator not present, allow (middleware will handle)
    if (requiresTenant === undefined) {
      return true;
    }

    // If explicitly set to false, allow
    if (requiresTenant === false) {
      return true;
    }

    // If true, validate tenant is present
    const request = context.switchToHttp().getRequest();

    if (!request.tenantId) {
      throw new BadRequestException(
        'Tenant context required for this route. Provide X-Tenant-ID header or use tenant subdomain.',
      );
    }

    return true;
  }
}
