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
import { BoardingLocationsService } from './boarding-locations.service';
import { CreateBoardingLocationDto } from './dto/create-boarding-location.dto';
import { UpdateBoardingLocationDto } from './dto/update-boarding-location.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('boarding-locations')
@ApiBearerAuth()
@Controller('agencies/:agencyId/boarding-locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BoardingLocationsController {
  constructor(
    private readonly boardingLocationsService: BoardingLocationsService,
  ) {}

  @Post()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Criar local de embarque',
    description:
      'Cria um novo local de embarque para a agência especificada. Superadmin e agency_admin podem criar locais de embarque.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: CreateBoardingLocationDto })
  @ApiResponse({
    status: 201,
    description: 'Local de embarque criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string' },
        city: { type: 'string' },
        agencyId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async create(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() createBoardingLocationDto: CreateBoardingLocationDto,
  ) {
    return this.boardingLocationsService.create(
      agencyId,
      createBoardingLocationDto,
    );
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Listar locais de embarque da agência',
    description:
      'Lista todos os locais de embarque de uma agência específica. Superadmin pode listar qualquer agência, agency_admin apenas do próprio tenant.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de locais de embarque retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          city: { type: 'string' },
          agencyId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findAllByAgency(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode listar qualquer agência
    if (user.role === 'superadmin') {
      return this.boardingLocationsService.findAllByAgency(agencyId);
    }

    // Se for agency_admin, só pode listar locais de embarque de agências do próprio tenant
    // Aqui precisaríamos verificar se a agência pertence ao tenant
    // Por enquanto, vamos assumir que o middleware de tenant já fez essa verificação
    return this.boardingLocationsService.findAllByAgency(agencyId);
  }

  @Get(':boardingLocationId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Detalhar local de embarque',
    description:
      'Retorna os detalhes de um local de embarque específico. Superadmin pode acessar qualquer local, agency_admin apenas do próprio tenant.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'boardingLocationId',
    description: 'ID do local de embarque',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do local de embarque retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string' },
        city: { type: 'string' },
        agencyId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Local de embarque não encontrado' })
  async findOne(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('boardingLocationId', ParseUUIDPipe) boardingLocationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode acessar qualquer local de embarque
    if (user.role === 'superadmin') {
      return this.boardingLocationsService.findOne(boardingLocationId);
    }

    // Se for agency_admin, só pode acessar locais de embarque da própria agência
    return this.boardingLocationsService.findOneByAgency(
      boardingLocationId,
      agencyId,
    );
  }

  @Patch(':boardingLocationId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Atualizar local de embarque',
    description:
      'Atualiza os dados de um local de embarque. Superadmin e agency_admin podem atualizar.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'boardingLocationId',
    description: 'ID do local de embarque',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateBoardingLocationDto })
  @ApiResponse({
    status: 200,
    description: 'Local de embarque atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string' },
        city: { type: 'string' },
        agencyId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Local de embarque não encontrado' })
  async update(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('boardingLocationId', ParseUUIDPipe) boardingLocationId: string,
    @Body() updateBoardingLocationDto: UpdateBoardingLocationDto,
  ) {
    return this.boardingLocationsService.updateByAgency(
      boardingLocationId,
      agencyId,
      updateBoardingLocationDto,
    );
  }

  @Delete(':boardingLocationId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Remover local de embarque',
    description:
      'Remove um local de embarque. Superadmin e agency_admin podem remover.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'boardingLocationId',
    description: 'ID do local de embarque',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Local de embarque removido com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Local de embarque não encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('boardingLocationId', ParseUUIDPipe) boardingLocationId: string,
  ) {
    await this.boardingLocationsService.removeByAgency(
      boardingLocationId,
      agencyId,
    );
  }
}
