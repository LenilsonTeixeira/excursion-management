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
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripResponseDto } from './dto/trip-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('trips')
@ApiBearerAuth()
@Controller('agencies/:agencyId/trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Criar nova viagem',
    description:
      'Cria uma nova viagem vinculada à agência especificada. Superadmin pode criar em qualquer agência, agency_admin apenas na própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: CreateTripDto })
  @ApiResponse({
    status: 201,
    description: 'Viagem criada com sucesso',
    type: TripResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 409, description: 'Slug já em uso nesta agência' })
  async create(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() createTripDto: CreateTripDto,
  ) {
    return this.tripsService.create(agencyId, createTripDto);
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin', 'agent')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Listar viagens da agência',
    description:
      'Lista todas as viagens de uma agência específica. Superadmin pode listar de qualquer agência, agency_admin e agent apenas da própria agência.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de viagens retornada com sucesso',
    type: [TripResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findAllByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    return this.tripsService.findAllByAgency(agencyId);
  }

  @Get(':tripId')
  @AllowRoles('superadmin', 'agency_admin', 'agent')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Detalhar viagem',
    description:
      'Retorna os detalhes de uma viagem específica. Superadmin pode acessar qualquer viagem, agency_admin e agent apenas da própria agência.',
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
    description: 'Detalhes da viagem retornados com sucesso',
    type: TripResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Viagem não encontrada' })
  async findOne(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode acessar qualquer viagem
    if (user.role === 'superadmin') {
      return this.tripsService.findOne(tripId);
    }

    // Se for agency_admin ou agent, só pode acessar viagens da própria agência
    return this.tripsService.findOneByAgency(tripId, agencyId);
  }

  @Patch(':tripId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Atualizar viagem',
    description:
      'Atualiza os dados de uma viagem. Superadmin pode atualizar qualquer viagem, agency_admin apenas da própria agência.',
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
  @ApiBody({ type: UpdateTripDto })
  @ApiResponse({
    status: 200,
    description: 'Viagem atualizada com sucesso',
    type: TripResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Viagem não encontrada' })
  @ApiResponse({ status: 409, description: 'Slug já em uso nesta agência' })
  async update(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() updateTripDto: UpdateTripDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode atualizar qualquer viagem
    if (user.role === 'superadmin') {
      return this.tripsService.update(tripId, updateTripDto);
    }

    // Se for agency_admin, só pode atualizar viagens da própria agência
    return this.tripsService.updateByAgency(tripId, agencyId, updateTripDto);
  }

  @Delete(':tripId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Remover viagem',
    description:
      'Remove uma viagem. Superadmin pode remover qualquer viagem, agency_admin apenas da própria agência.',
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
  @ApiResponse({ status: 204, description: 'Viagem removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Viagem não encontrada' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Se for superadmin, pode remover qualquer viagem
    if (user.role === 'superadmin') {
      await this.tripsService.remove(tripId);
    } else {
      // Se for agency_admin, só pode remover viagens da própria agência
      await this.tripsService.removeByAgency(tripId, agencyId);
    }
  }
}
