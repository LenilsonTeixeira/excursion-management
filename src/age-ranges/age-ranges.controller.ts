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
import { AgeRangesService } from './age-ranges.service';
import { CreateAgeRangeDto } from './dto/create-age-range.dto';
import { UpdateAgeRangeDto } from './dto/update-age-range.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('age-ranges')
@ApiBearerAuth()
@Controller('agencies/:agencyId/age-ranges')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgeRangesController {
  constructor(private readonly ageRangesService: AgeRangesService) {}

  @Post()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Criar nova faixa etária',
    description:
      'Cria uma nova faixa etária vinculada à agência especificada. Superadmin pode criar em qualquer agência, agency_admin apenas na própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: CreateAgeRangeDto })
  @ApiResponse({
    status: 201,
    description: 'Faixa etária criada com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        minAge: { type: 'number' },
        maxAge: { type: 'number' },
        occupiesSeat: { type: 'boolean' },
        agencyId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 409,
    description:
      'Nome da faixa etária já em uso nesta agência ou sobreposição de faixas',
  })
  async create(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() createAgeRangeDto: CreateAgeRangeDto,
  ) {
    return this.ageRangesService.create(agencyId, createAgeRangeDto);
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Listar faixas etárias da agência',
    description:
      'Lista todas as faixas etárias de uma agência específica. Superadmin pode listar de qualquer agência, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de faixas etárias retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          minAge: { type: 'number' },
          maxAge: { type: 'number' },
          occupiesSeat: { type: 'boolean' },
          agencyId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findAllByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    return this.ageRangesService.findAllByAgency(agencyId);
  }

  @Get(':ageRangeId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Detalhar faixa etária',
    description:
      'Retorna os detalhes de uma faixa etária específica. Superadmin pode acessar qualquer faixa etária, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'ageRangeId',
    description: 'ID da faixa etária',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da faixa etária retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        minAge: { type: 'number' },
        maxAge: { type: 'number' },
        occupiesSeat: { type: 'boolean' },
        agencyId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 404,
    description: 'Faixa etária não encontrada',
  })
  async findOne(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('ageRangeId', ParseUUIDPipe) ageRangeId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode acessar qualquer faixa etária
    if (user.role === 'superadmin') {
      return this.ageRangesService.findOne(ageRangeId);
    }

    // Se for agency_admin, só pode acessar faixas etárias da própria agência
    return this.ageRangesService.findOneByAgency(ageRangeId, agencyId);
  }

  @Patch(':ageRangeId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Atualizar faixa etária',
    description:
      'Atualiza os dados de uma faixa etária. Superadmin pode atualizar qualquer faixa etária, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'ageRangeId',
    description: 'ID da faixa etária',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateAgeRangeDto })
  @ApiResponse({
    status: 200,
    description: 'Faixa etária atualizada com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        minAge: { type: 'number' },
        maxAge: { type: 'number' },
        occupiesSeat: { type: 'boolean' },
        agencyId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 404,
    description: 'Faixa etária não encontrada',
  })
  @ApiResponse({
    status: 409,
    description:
      'Nome da faixa etária já em uso nesta agência ou sobreposição de faixas',
  })
  async update(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('ageRangeId', ParseUUIDPipe) ageRangeId: string,
    @Body() updateAgeRangeDto: UpdateAgeRangeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode atualizar qualquer faixa etária
    if (user.role === 'superadmin') {
      return this.ageRangesService.update(ageRangeId, updateAgeRangeDto);
    }

    // Se for agency_admin, só pode atualizar faixas etárias da própria agência
    return this.ageRangesService.updateByAgency(
      ageRangeId,
      agencyId,
      updateAgeRangeDto,
    );
  }

  @Delete(':ageRangeId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Remover faixa etária',
    description:
      'Remove uma faixa etária. Superadmin pode remover qualquer faixa etária, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'ageRangeId',
    description: 'ID da faixa etária',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Faixa etária removida com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 404,
    description: 'Faixa etária não encontrada',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('ageRangeId', ParseUUIDPipe) ageRangeId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode remover qualquer faixa etária
    if (user.role === 'superadmin') {
      await this.ageRangesService.remove(ageRangeId);
    } else {
      // Se for agency_admin, só pode remover faixas etárias da própria agência
      await this.ageRangesService.removeByAgency(ageRangeId, agencyId);
    }
  }
}
