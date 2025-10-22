import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAgency = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const agencyId = request.params.agencyId;

    if (!agencyId) {
      throw new Error('agencyId não encontrado nos parâmetros da requisição');
    }

    return data ? agencyId : agencyId;
  },
);
