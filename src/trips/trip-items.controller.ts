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
import { TripItemsService } from './trip-items.service';
import { CreateTripItemDto } from './dto/create-trip-item.dto';
import { UpdateTripItemDto } from './dto/update-trip-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';

@ApiTags('trip-items')
@ApiBearerAuth()
@Controller('agencies/:agencyId/trips/:tripId/items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripItemsController {
  constructor(private readonly tripItemsService: TripItemsService) {}

  @Post()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Criar item da viagem',
    description: 'Cria um novo item (incluído ou não incluído) para a viagem.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripId',
    description: 'ID da viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: CreateTripItemDto })
  @ApiResponse({
    status: 201,
    description: 'Item criado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Viagem não encontrada' })
  async create(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() createDto: CreateTripItemDto,
  ) {
    return this.tripItemsService.create(tripId, createDto);
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin', 'agent')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Listar itens da viagem',
    description: 'Lista todos os itens de uma viagem.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripId',
    description: 'ID da viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findAll(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
  ) {
    return this.tripItemsService.findAllByTrip(tripId);
  }

  @Get(':itemId')
  @AllowRoles('superadmin', 'agency_admin', 'agent')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Detalhar item',
    description: 'Retorna os detalhes de um item específico.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripId',
    description: 'ID da viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID do item',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Item retornado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  async findOne(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.tripItemsService.findOneByTrip(itemId, tripId);
  }

  @Patch(':itemId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Atualizar item',
    description: 'Atualiza um item da viagem.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripId',
    description: 'ID da viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID do item',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateTripItemDto })
  @ApiResponse({
    status: 200,
    description: 'Item atualizado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  async update(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateDto: UpdateTripItemDto,
  ) {
    return this.tripItemsService.updateByTrip(itemId, tripId, updateDto);
  }

  @Delete(':itemId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Remover item',
    description: 'Remove um item da viagem.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripId',
    description: 'ID da viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID do item',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Item removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    await this.tripItemsService.remove(itemId, tripId);
  }
}
