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
import { AgencySocialsService } from './agency-socials.service';
import { CreateAgencySocialDto } from './dto/create-agency-social.dto';
import { UpdateAgencySocialDto } from './dto/create-agency-social.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AgencyTenantGuard } from '../common/guards/agency-tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentAgency } from '../common/decorators/current-agency.decorator';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Agency Socials')
@ApiBearerAuth()
@Controller('agencies/:agencyId/socials')
@UseGuards(JwtAuthGuard, RolesGuard, AgencyTenantGuard)
export class AgencySocialsController {
  constructor(private readonly socialsService: AgencySocialsService) {}

  @Post()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Criar rede social para agência' })
  @ApiResponse({ status: 201, description: 'Rede social criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Plataforma já existe para esta agência',
  })
  async create(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() createSocialDto: CreateAgencySocialDto,
  ) {
    return this.socialsService.create(agencyId, createSocialDto);
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Listar redes sociais da agência' })
  @ApiResponse({ status: 200, description: 'Lista de redes sociais' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async findAllByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    return this.socialsService.findAllByAgency(agencyId);
  }

  @Get('active')
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Listar redes sociais ativas da agência' })
  @ApiResponse({ status: 200, description: 'Lista de redes sociais ativas' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async findActiveByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    return this.socialsService.findActiveByAgency(agencyId);
  }

  @Get(':id')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({ summary: 'Obter rede social específica' })
  @ApiResponse({ status: 200, description: 'Rede social encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Rede social não encontrada' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === 'superadmin') {
      return this.socialsService.findOne(id);
    }
    return this.socialsService.findOneByAgency(id, agencyId);
  }

  @Patch(':id')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({ summary: 'Atualizar rede social' })
  @ApiResponse({
    status: 200,
    description: 'Rede social atualizada com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Rede social não encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Plataforma já existe para esta agência',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() updateSocialDto: UpdateAgencySocialDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === 'superadmin') {
      return this.socialsService.update(id, updateSocialDto);
    }
    return this.socialsService.updateByAgency(id, agencyId, updateSocialDto);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Remover rede social' })
  @ApiResponse({ status: 200, description: 'Rede social removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Rede social não encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.socialsService.remove(id);
    return { message: 'Rede social removida com sucesso' };
  }

  @Get('platform/:platform')
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Obter rede social por plataforma' })
  @ApiResponse({ status: 200, description: 'Rede social encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Rede social não encontrada' })
  async findByPlatformAndAgency(
    @Param('platform') platform: string,
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
  ) {
    return this.socialsService.findByTypeAndAgency(platform, agencyId);
  }

  @Get('count/total')
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Contar redes sociais da agência' })
  @ApiResponse({ status: 200, description: 'Contagem de redes sociais' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async countByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    const count = await this.socialsService.countByAgency(agencyId);
    return { count };
  }
}
