import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AgenciesService } from './agencies.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('agencies')
@ApiBearerAuth()
@Controller('agencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Post('tenants/:tenantId/agencies')
  @Roles('superadmin')
  @ApiOperation({
    summary: 'Criar nova agência',
    description:
      'Cria uma nova agência vinculada ao tenant especificado. Apenas superadmin pode criar agências.',
  })
  @ApiParam({
    name: 'tenantId',
    description: 'ID do tenant',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: CreateAgencyDto })
  @ApiResponse({
    status: 201,
    description: 'Agência criada com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        tenantId: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        cadastur: { type: 'string' },
        cnpj: { type: 'string' },
        description: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 409, description: 'CADASTUR ou CNPJ já em uso' })
  async create(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() createAgencyDto: CreateAgencyDto,
  ) {
    return this.agenciesService.create(tenantId, createAgencyDto);
  }

  @Get('tenants/:tenantId/agencies')
  @Roles('superadmin')
  @ApiOperation({
    summary: 'Listar agências do tenant',
    description:
      'Lista todas as agências de um tenant específico. Apenas superadmin pode listar.',
  })
  @ApiParam({
    name: 'tenantId',
    description: 'ID do tenant',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de agências retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tenantId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          cadastur: { type: 'string' },
          cnpj: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findAllByTenant(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.agenciesService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Detalhar agência',
    description:
      'Retorna os detalhes de uma agência específica. Superadmin pode acessar qualquer agência, agency_admin apenas do próprio tenant.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da agência retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        tenantId: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        cadastur: { type: 'string' },
        cnpj: { type: 'string' },
        description: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @CurrentTenant('tenantId') tenantId: string,
  ) {
    // Se for superadmin, pode acessar qualquer agência
    if (user.role === 'superadmin') {
      return this.agenciesService.findOne(id);
    }

    // Se for agency_admin, só pode acessar agências do próprio tenant
    return this.agenciesService.findOneByTenant(id, tenantId);
  }

  @Patch(':id')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Atualizar agência',
    description:
      'Atualiza os dados de uma agência. Superadmin pode atualizar qualquer agência, agency_admin apenas do próprio tenant.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateAgencyDto })
  @ApiResponse({
    status: 200,
    description: 'Agência atualizada com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        tenantId: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        cadastur: { type: 'string' },
        cnpj: { type: 'string' },
        description: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  @ApiResponse({ status: 409, description: 'CADASTUR ou CNPJ já em uso' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAgencyDto: UpdateAgencyDto,
    @CurrentUser() user: JwtPayload,
    @CurrentTenant('tenantId') tenantId: string,
  ) {
    // Se for superadmin, pode atualizar qualquer agência
    if (user.role === 'superadmin') {
      return this.agenciesService.update(id, updateAgencyDto);
    }

    // Se for agency_admin, só pode atualizar agências do próprio tenant
    return this.agenciesService.updateByTenant(id, tenantId, updateAgencyDto);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({
    summary: 'Remover agência',
    description: 'Remove uma agência. Apenas superadmin pode remover agências.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Agência removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.agenciesService.remove(id);
  }
}
