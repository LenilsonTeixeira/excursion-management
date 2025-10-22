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
import { AgencyPhonesService } from './agency-phones.service';
import { CreateAgencyPhoneDto } from './dto/create-agency-phone.dto';
import { UpdateAgencyPhoneDto } from './dto/create-agency-phone.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AgencyTenantGuard } from '../common/guards/agency-tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentAgency } from '../common/decorators/current-agency.decorator';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Agency Phones')
@ApiBearerAuth()
@Controller('agencies/:agencyId/phones')
@UseGuards(JwtAuthGuard, RolesGuard, AgencyTenantGuard)
export class AgencyPhonesController {
  constructor(private readonly phonesService: AgencyPhonesService) {}

  @Post()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Criar telefone para agência' })
  @ApiResponse({ status: 201, description: 'Telefone criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  @ApiResponse({ status: 409, description: 'Número já está em uso' })
  async create(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() createPhoneDto: CreateAgencyPhoneDto,
  ) {
    return this.phonesService.create(agencyId, createPhoneDto);
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Listar telefones da agência' })
  @ApiResponse({ status: 200, description: 'Lista de telefones' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async findAllByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    return this.phonesService.findAllByAgency(agencyId);
  }

  @Get(':id')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({ summary: 'Obter telefone específico' })
  @ApiResponse({ status: 200, description: 'Telefone encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Telefone não encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === 'superadmin') {
      return this.phonesService.findOne(id);
    }
    return this.phonesService.findOneByAgency(id, agencyId);
  }

  @Patch(':id')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({ summary: 'Atualizar telefone' })
  @ApiResponse({ status: 200, description: 'Telefone atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Telefone não encontrado' })
  @ApiResponse({ status: 409, description: 'Número já está em uso' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() updatePhoneDto: UpdateAgencyPhoneDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === 'superadmin') {
      return this.phonesService.update(id, updatePhoneDto);
    }
    return this.phonesService.updateByAgency(id, agencyId, updatePhoneDto);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Remover telefone' })
  @ApiResponse({ status: 200, description: 'Telefone removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Telefone não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.phonesService.remove(id);
    return { message: 'Telefone removido com sucesso' };
  }

  @Get('main/current')
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Obter telefone principal da agência' })
  @ApiResponse({ status: 200, description: 'Telefone principal encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async findMainByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    return this.phonesService.findMainByAgency(agencyId);
  }

  @Get('count/total')
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Contar telefones da agência' })
  @ApiResponse({ status: 200, description: 'Contagem de telefones' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async countByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    const count = await this.phonesService.countByAgency(agencyId);
    return { count };
  }
}
