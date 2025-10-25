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
import { TripGeneralInfoService } from './trip-general-info.service';
import { CreateGeneralInfoItemDto } from './dto/create-general-info-item.dto';
import { UpdateGeneralInfoItemDto } from './dto/update-general-info-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';

@ApiTags('trip-general-info')
@ApiBearerAuth()
@Controller('agencies/:agencyId/trips/:tripId/general-info')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripGeneralInfoController {
  constructor(
    private readonly tripGeneralInfoService: TripGeneralInfoService,
  ) {}

  @Post()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Criar item de informação geral',
    description: 'Cria um novo item de informação geral para a viagem.',
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
  @ApiBody({ type: CreateGeneralInfoItemDto })
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
    @Body() createDto: CreateGeneralInfoItemDto,
  ) {
    return this.tripGeneralInfoService.create(tripId, createDto);
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin', 'agent')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Listar informações gerais da viagem',
    description: 'Lista todos os itens de informação geral de uma viagem.',
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
    return this.tripGeneralInfoService.findAllByTrip(tripId);
  }

  @Get(':infoId')
  @AllowRoles('superadmin', 'agency_admin', 'agent')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Detalhar item de informação',
    description: 'Retorna os detalhes de um item de informação específico.',
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
    name: 'infoId',
    description: 'ID do item de informação',
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
    @Param('infoId', ParseUUIDPipe) infoId: string,
  ) {
    return this.tripGeneralInfoService.findOneByTrip(infoId, tripId);
  }

  @Patch(':infoId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Atualizar item de informação',
    description: 'Atualiza um item de informação geral.',
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
    name: 'infoId',
    description: 'ID do item de informação',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateGeneralInfoItemDto })
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
    @Param('infoId', ParseUUIDPipe) infoId: string,
    @Body() updateDto: UpdateGeneralInfoItemDto,
  ) {
    return this.tripGeneralInfoService.updateByTrip(infoId, tripId, updateDto);
  }

  @Delete(':infoId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Remover item de informação',
    description: 'Remove um item de informação geral.',
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
    name: 'infoId',
    description: 'ID do item de informação',
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
    @Param('infoId', ParseUUIDPipe) infoId: string,
  ) {
    await this.tripGeneralInfoService.remove(infoId, tripId);
  }
}
