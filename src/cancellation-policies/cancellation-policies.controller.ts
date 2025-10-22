import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CancellationPoliciesService } from './cancellation-policies.service';
import { CreateCancellationPolicyDto } from './dto/create-cancellation-policy.dto';
import { UpdateCancellationPolicyDto } from './dto/update-cancellation-policy.dto';
import { CancellationPolicyResponseDto } from './dto/cancellation-policy-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('cancellation-policies')
@ApiBearerAuth()
@Controller('agencies/:agencyId/cancellation-policies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CancellationPoliciesController {
  constructor(
    private readonly cancellationPoliciesService: CancellationPoliciesService,
  ) {}

  @Post()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Criar nova política de cancelamento',
    description:
      'Cria uma nova política de cancelamento vinculada à agência especificada. Superadmin pode criar em qualquer agência, agency_admin apenas na própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: CreateCancellationPolicyDto })
  @ApiResponse({
    status: 201,
    description: 'Política de cancelamento criada com sucesso',
    type: CancellationPolicyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 409,
    description: 'Nome da política já em uso nesta agência ou regras inválidas',
  })
  async create(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() createCancellationPolicyDto: CreateCancellationPolicyDto,
  ) {
    return this.cancellationPoliciesService.create(
      agencyId,
      createCancellationPolicyDto,
    );
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Listar políticas de cancelamento da agência',
    description:
      'Lista todas as políticas de cancelamento de uma agência específica. Superadmin pode listar de qualquer agência, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de políticas de cancelamento retornada com sucesso',
    type: [CancellationPolicyResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findAllByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    return this.cancellationPoliciesService.findAllByAgency(agencyId);
  }

  @Get('default')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Buscar política padrão da agência',
    description:
      'Retorna a política de cancelamento padrão de uma agência específica.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Política padrão retornada com sucesso',
    type: CancellationPolicyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Política padrão não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findDefaultByAgency(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
  ) {
    const policy =
      await this.cancellationPoliciesService.findDefaultByAgency(agencyId);
    if (!policy) {
      throw new NotFoundException('Política padrão não encontrada');
    }
    return policy;
  }

  @Get(':policyId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Detalhar política de cancelamento',
    description:
      'Retorna os detalhes de uma política de cancelamento específica. Superadmin pode acessar qualquer política, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'policyId',
    description: 'ID da política de cancelamento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da política de cancelamento retornados com sucesso',
    type: CancellationPolicyResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 404,
    description: 'Política de cancelamento não encontrada',
  })
  async findOne(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('policyId', ParseUUIDPipe) policyId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode acessar qualquer política
    if (user.role === 'superadmin') {
      return this.cancellationPoliciesService.findOne(policyId);
    }

    // Se for agency_admin, só pode acessar políticas da própria agência
    return this.cancellationPoliciesService.findOneByAgency(policyId, agencyId);
  }

  @Put(':policyId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Atualizar política de cancelamento',
    description:
      'Atualiza os dados de uma política de cancelamento. Superadmin pode atualizar qualquer política, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'policyId',
    description: 'ID da política de cancelamento',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCancellationPolicyDto })
  @ApiResponse({
    status: 200,
    description: 'Política de cancelamento atualizada com sucesso',
    type: CancellationPolicyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 404,
    description: 'Política de cancelamento não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Nome da política já em uso nesta agência ou regras inválidas',
  })
  async update(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('policyId', ParseUUIDPipe) policyId: string,
    @Body() updateCancellationPolicyDto: UpdateCancellationPolicyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode atualizar qualquer política
    if (user.role === 'superadmin') {
      return this.cancellationPoliciesService.update(
        policyId,
        updateCancellationPolicyDto,
      );
    }

    // Se for agency_admin, só pode atualizar políticas da própria agência
    return this.cancellationPoliciesService.updateByAgency(
      policyId,
      agencyId,
      updateCancellationPolicyDto,
    );
  }

  @Delete(':policyId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Remover política de cancelamento',
    description:
      'Remove uma política de cancelamento. Superadmin pode remover qualquer política, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'policyId',
    description: 'ID da política de cancelamento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Política de cancelamento removida com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 404,
    description: 'Política de cancelamento não encontrada',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('policyId', ParseUUIDPipe) policyId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode remover qualquer política
    if (user.role === 'superadmin') {
      await this.cancellationPoliciesService.remove(policyId);
    } else {
      // Se for agency_admin, só pode remover políticas da própria agência
      await this.cancellationPoliciesService.removeByAgency(policyId, agencyId);
    }
  }
}
