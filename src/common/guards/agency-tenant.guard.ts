import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class AgencyTenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;
    const tenantId = request.headers['x-tenant-id'];

    // Superadmin pode acessar qualquer tenant
    if (user.role === 'superadmin') {
      return true;
    }

    // Verificar se o tenant do usuário coincide com o tenant da requisição
    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('Acesso negado: tenant não autorizado');
    }

    return true;
  }
}
