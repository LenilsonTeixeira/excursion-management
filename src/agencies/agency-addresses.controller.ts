import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AgencyAddressesService } from './agency-addresses.service';
import { CreateAgencyAddressDto } from './dto/create-agency-address.dto';
import { UpdateAgencyAddressDto } from './dto/create-agency-address.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AgencyTenantGuard } from '../common/guards/agency-tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Agency Addresses')
@ApiBearerAuth()
@Controller('agencies/:agencyId/addresses')
@UseGuards(JwtAuthGuard, RolesGuard, AgencyTenantGuard)
export class AgencyAddressesController {
  constructor(private readonly addressesService: AgencyAddressesService) {}

  @Post()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Criar endereço para agência' })
  @ApiResponse({ status: 201, description: 'Endereço criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async create(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() createAddressDto: CreateAgencyAddressDto,
  ) {
    return this.addressesService.create(agencyId, createAddressDto);
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Listar endereços da agência' })
  @ApiResponse({ status: 200, description: 'Lista de endereços' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async findAllByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    return this.addressesService.findAllByAgency(agencyId);
  }

  @Get(':id')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({ summary: 'Obter endereço específico' })
  @ApiResponse({ status: 200, description: 'Endereço encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === 'superadmin') {
      return this.addressesService.findOne(id);
    }
    return this.addressesService.findOneByAgency(id, agencyId);
  }

  @Patch(':id')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({ summary: 'Atualizar endereço' })
  @ApiResponse({ status: 200, description: 'Endereço atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() updateAddressDto: UpdateAgencyAddressDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === 'superadmin') {
      return this.addressesService.update(id, updateAddressDto);
    }
    return this.addressesService.updateByAgency(id, agencyId, updateAddressDto);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Remover endereço' })
  @ApiResponse({ status: 200, description: 'Endereço removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.addressesService.remove(id);
    return { message: 'Endereço removido com sucesso' };
  }

  @Get('main/current')
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Obter endereço principal da agência' })
  @ApiResponse({ status: 200, description: 'Endereço principal encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async findMainByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    return this.addressesService.findMainByAgency(agencyId);
  }

  @Get('count/total')
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Contar endereços da agência' })
  @ApiResponse({ status: 200, description: 'Contagem de endereços' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async countByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    const count = await this.addressesService.countByAgency(agencyId);
    return { count };
  }
}
