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
import { TripAgePriceGroupsService } from './trip-age-price-groups.service';
import { CreateTripAgePriceGroupDto } from './dto/create-trip-age-price-group.dto';
import { UpdateTripAgePriceGroupDto } from './dto/update-trip-age-price-group.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';

@ApiTags('trip-price-groups')
@ApiBearerAuth()
@Controller('agencies/:agencyId/trips/:tripId/price-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripAgePriceGroupsController {
  constructor(private readonly priceGroupsService: TripAgePriceGroupsService) {}

  @Post()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Criar grupo de preço para viagem',
    description:
      'Cria um novo grupo de preço baseado na faixa etária para a viagem.',
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
  @ApiBody({ type: CreateTripAgePriceGroupDto })
  @ApiResponse({
    status: 201,
    description: 'Grupo de preço criado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Viagem não encontrada' })
  async create(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() createDto: CreateTripAgePriceGroupDto,
  ) {
    return this.priceGroupsService.create(tripId, createDto);
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin', 'agent')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Listar grupos de preço da viagem',
    description:
      'Lista todos os grupos de preço por faixa etária de uma viagem.',
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
  async findAllByTrip(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
  ) {
    return this.priceGroupsService.findAllByTrip(tripId);
  }

  @Get(':priceGroupId')
  @AllowRoles('superadmin', 'agency_admin', 'agent')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Obter grupo de preço',
    description: 'Retorna os detalhes de um grupo de preço específico.',
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
    name: 'priceGroupId',
    description: 'ID do grupo de preço',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo de preço retornado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Grupo de preço não encontrado' })
  async findOne(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Param('priceGroupId', ParseUUIDPipe) priceGroupId: string,
  ) {
    return this.priceGroupsService.findOneByTrip(priceGroupId, tripId);
  }

  @Patch(':priceGroupId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Atualizar grupo de preço',
    description: 'Atualiza um grupo de preço específico.',
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
    name: 'priceGroupId',
    description: 'ID do grupo de preço',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateTripAgePriceGroupDto })
  @ApiResponse({
    status: 200,
    description: 'Grupo de preço atualizado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Grupo de preço não encontrado' })
  async update(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Param('priceGroupId', ParseUUIDPipe) priceGroupId: string,
    @Body() updateDto: UpdateTripAgePriceGroupDto,
  ) {
    return this.priceGroupsService.updateByTrip(
      priceGroupId,
      tripId,
      updateDto,
    );
  }

  @Delete(':priceGroupId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Remover grupo de preço',
    description: 'Remove um grupo de preço de uma viagem.',
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
    name: 'priceGroupId',
    description: 'ID do grupo de preço',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Grupo de preço removido com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Grupo de preço não encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Param('priceGroupId', ParseUUIDPipe) priceGroupId: string,
  ) {
    await this.priceGroupsService.remove(priceGroupId, tripId);
  }
}
