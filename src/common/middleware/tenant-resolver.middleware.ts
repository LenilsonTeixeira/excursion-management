import {
  Injectable,
  NestMiddleware,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsRepository } from '../../tenants/tenants.repository';

// Extend Express Request to include tenant
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantSlug?: string;
    }
  }
}

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantResolverMiddleware.name);

  constructor(private readonly tenantsRepository: TenantsRepository) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Use originalUrl to get the actual path before NestJS routing
    const path = req.originalUrl.split('?')[0]; // Remove query params if any

    let slug: string | undefined;

    // 1. Try to get slug from X-Tenant-ID header (useful for tests/curl)
    const headerSlug = req.header('X-Tenant-ID');
    if (headerSlug) {
      slug = headerSlug;
    }

    // 2. Fallback: Extract from subdomain (production)
    if (!slug) {
      const host = req.header('host');
      if (host) {
        slug = this.extractSlugFromHost(host);
      }
    }

    // 3. If no slug found, check if this is an admin/global route
    if (!slug) {
      // Allow requests without tenant for admin routes and public auth routes
      const isAdminRoute = path.startsWith('/admin/');
      const isAuthRoute = path.startsWith('/auth/');
      const isApiDocsRoute = path.startsWith('/api');

      if (isAdminRoute || isAuthRoute || isApiDocsRoute) {
        return next();
      }

      // For other routes, tenant is required
      throw new NotFoundException(
        'Tenant not specified. Provide X-Tenant-ID header or use tenant subdomain',
      );
    }

    // 4. Validate tenant exists
    const tenant = await this.tenantsRepository.findBySlug(slug);

    if (!tenant) {
      this.logger.warn(`Tenant not found: ${slug}`);
      throw new NotFoundException(`Tenant not found: ${slug}`);
    }

    // 5. Attach tenant to request
    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;

    this.logger.log(`Tenant resolved: ${tenant.slug} (${tenant.id})`);

    next();
  }

  /**
   * Extracts tenant slug from subdomain
   * Examples:
   *   agencia123.example.com -> agencia123
   *   agencia123.localhost:3000 -> agencia123
   *   localhost:3000 -> undefined (no subdomain)
   *   example.com -> undefined (no subdomain)
   */
  private extractSlugFromHost(host: string): string | undefined {
    // Remove port if present
    const hostWithoutPort = host.split(':')[0];

    // Split by dots
    const parts = hostWithoutPort.split('.');

    // Special case: localhost with subdomain (e.g., tenant.localhost)
    if (parts.length === 2 && parts[1] === 'localhost') {
      const slug = parts[0];
      // Validate it's not 'www' or other common non-tenant subdomains
      if (slug === 'www' || slug === 'api') {
        return undefined;
      }
      return slug;
    }

    // If only one part (localhost) or two parts (domain.com), no subdomain
    if (parts.length <= 2) {
      return undefined;
    }

    // Return first part as slug (the subdomain)
    const slug = parts[0];

    // Validate it's not 'www' or other common non-tenant subdomains
    if (slug === 'www' || slug === 'api') {
      return undefined;
    }

    return slug;
  }
}
