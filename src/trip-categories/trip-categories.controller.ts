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
import { TripCategoriesService } from './trip-categories.service';
import { CreateTripCategoryDto } from './dto/create-trip-category.dto';
import { UpdateTripCategoryDto } from './dto/update-trip-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('trip-categories')
@ApiBearerAuth()
@Controller('agencies/:agencyId/trip-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripCategoriesController {
  constructor(private readonly tripCategoriesService: TripCategoriesService) {}

  @Post()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Criar nova categoria de viagem',
    description:
      'Cria uma nova categoria de viagem vinculada à agência especificada. Superadmin pode criar em qualquer agência, agency_admin apenas na própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: CreateTripCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Categoria de viagem criada com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
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
    description: 'Nome da categoria já em uso nesta agência',
  })
  async create(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() createTripCategoryDto: CreateTripCategoryDto,
  ) {
    return this.tripCategoriesService.create(agencyId, createTripCategoryDto);
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Listar categorias de viagem da agência',
    description:
      'Lista todas as categorias de viagem de uma agência específica. Superadmin pode listar de qualquer agência, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias de viagem retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
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
    return this.tripCategoriesService.findAllByAgency(agencyId);
  }

  @Get(':tripCategoryId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Detalhar categoria de viagem',
    description:
      'Retorna os detalhes de uma categoria de viagem específica. Superadmin pode acessar qualquer categoria, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripCategoryId',
    description: 'ID da categoria de viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da categoria de viagem retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
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
    description: 'Categoria de viagem não encontrada',
  })
  async findOne(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripCategoryId', ParseUUIDPipe) tripCategoryId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode acessar qualquer categoria
    if (user.role === 'superadmin') {
      return this.tripCategoriesService.findOne(tripCategoryId);
    }

    // Se for agency_admin, só pode acessar categorias da própria agência
    return this.tripCategoriesService.findOneByAgency(tripCategoryId, agencyId);
  }

  @Patch(':tripCategoryId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Atualizar categoria de viagem',
    description:
      'Atualiza os dados de uma categoria de viagem. Superadmin pode atualizar qualquer categoria, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripCategoryId',
    description: 'ID da categoria de viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateTripCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Categoria de viagem atualizada com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
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
    description: 'Categoria de viagem não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Nome da categoria já em uso nesta agência',
  })
  async update(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripCategoryId', ParseUUIDPipe) tripCategoryId: string,
    @Body() updateTripCategoryDto: UpdateTripCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode atualizar qualquer categoria
    if (user.role === 'superadmin') {
      return this.tripCategoriesService.update(
        tripCategoryId,
        updateTripCategoryDto,
      );
    }

    // Se for agency_admin, só pode atualizar categorias da própria agência
    return this.tripCategoriesService.updateByAgency(
      tripCategoryId,
      agencyId,
      updateTripCategoryDto,
    );
  }

  @Delete(':tripCategoryId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Remover categoria de viagem',
    description:
      'Remove uma categoria de viagem. Superadmin pode remover qualquer categoria, agency_admin apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripCategoryId',
    description: 'ID da categoria de viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Categoria de viagem removida com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 404,
    description: 'Categoria de viagem não encontrada',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripCategoryId', ParseUUIDPipe) tripCategoryId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode remover qualquer categoria
    if (user.role === 'superadmin') {
      await this.tripCategoriesService.remove(tripCategoryId);
    } else {
      // Se for agency_admin, só pode remover categorias da própria agência
      await this.tripCategoriesService.removeByAgency(tripCategoryId, agencyId);
    }
  }
}
