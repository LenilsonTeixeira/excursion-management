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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('agencies/:agencyId/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

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
  @ApiBody({ type: CreateCategoryDto })
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
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(agencyId, createCategoryDto);
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
    return this.categoriesService.findAllByAgency(agencyId);
  }

  @Get(':categoryId')
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
    name: 'categoryId',
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
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode acessar qualquer categoria
    if (user.role === 'superadmin') {
      return this.categoriesService.findOne(categoryId);
    }

    // Se for agency_admin, só pode acessar categorias da própria agência
    return this.categoriesService.findOneByAgency(categoryId, agencyId);
  }

  @Patch(':categoryId')
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
    name: 'categoryId',
    description: 'ID da categoria de viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCategoryDto })
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
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode atualizar qualquer categoria
    if (user.role === 'superadmin') {
      return this.categoriesService.update(categoryId, updateCategoryDto);
    }

    // Se for agency_admin, só pode atualizar categorias da própria agência
    return this.categoriesService.updateByAgency(
      categoryId,
      agencyId,
      updateCategoryDto,
    );
  }

  @Delete(':categoryId')
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
    name: 'categoryId',
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
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode remover qualquer categoria
    if (user.role === 'superadmin') {
      await this.categoriesService.remove(categoryId);
    } else {
      // Se for agency_admin, só pode remover categorias da própria agência
      await this.categoriesService.removeByAgency(categoryId, agencyId);
    }
  }
}
