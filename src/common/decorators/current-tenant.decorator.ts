import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
}

/**
 * Decorator to inject current tenant from request context
 * Usage: findAll(@CurrentTenant() tenant: TenantContext)
 */
export const CurrentTenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.tenantId) {
      return undefined;
    }

    const tenant: TenantContext = {
      tenantId: request.tenantId,
      tenantSlug: request.tenantSlug,
    };

    return data ? tenant[data] : tenant;
  },
);

