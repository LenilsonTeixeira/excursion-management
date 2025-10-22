import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const user: JwtPayload = request.user;
    const tenantId = request.tenantId;
    const tenantSlug = request.tenantSlug;

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          this.logger.log({
            timestamp: new Date().toISOString(),
            method,
            url,
            userId: user?.sub,
            userEmail: user?.email,
            userRole: user?.role,
            userTenantId: user?.tenantId,
            requestTenantId: tenantId,
            tenantSlug: tenantSlug,
            statusCode: context.switchToHttp().getResponse().statusCode,
            responseTime: `${responseTime}ms`,
            // Don't log sensitive data like passwords
            body: this.sanitizeBody(body),
          });
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error({
            timestamp: new Date().toISOString(),
            method,
            url,
            userId: user?.sub,
            userEmail: user?.email,
            userRole: user?.role,
            userTenantId: user?.tenantId,
            requestTenantId: tenantId,
            tenantSlug: tenantSlug,
            statusCode: error.status || 500,
            responseTime: `${responseTime}ms`,
            error: error.message,
          });
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret'];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}

