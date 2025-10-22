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
import { AgencyEmailsService } from './agency-emails.service';
import { CreateAgencyEmailDto } from './dto/create-agency-email.dto';
import { UpdateAgencyEmailDto } from './dto/create-agency-email.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AgencyTenantGuard } from '../common/guards/agency-tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Agency Emails')
@ApiBearerAuth()
@Controller('agencies/:agencyId/emails')
@UseGuards(JwtAuthGuard, RolesGuard, AgencyTenantGuard)
export class AgencyEmailsController {
  constructor(private readonly emailsService: AgencyEmailsService) {}

  @Post()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Criar email para agência' })
  @ApiResponse({ status: 201, description: 'Email criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  async create(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() createEmailDto: CreateAgencyEmailDto,
  ) {
    return this.emailsService.create(agencyId, createEmailDto);
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Listar emails da agência' })
  @ApiResponse({ status: 200, description: 'Lista de emails' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async findAllByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    return this.emailsService.findAllByAgency(agencyId);
  }

  @Get(':id')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({ summary: 'Obter email específico' })
  @ApiResponse({ status: 200, description: 'Email encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Email não encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === 'superadmin') {
      return this.emailsService.findOne(id);
    }
    return this.emailsService.findOneByAgency(id, agencyId);
  }

  @Patch(':id')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({ summary: 'Atualizar email' })
  @ApiResponse({ status: 200, description: 'Email atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Email não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Body() updateEmailDto: UpdateAgencyEmailDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === 'superadmin') {
      return this.emailsService.update(id, updateEmailDto);
    }
    return this.emailsService.updateByAgency(id, agencyId, updateEmailDto);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Remover email' })
  @ApiResponse({ status: 200, description: 'Email removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Email não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.emailsService.remove(id);
    return { message: 'Email removido com sucesso' };
  }

  @Get('main/current')
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Obter email principal da agência' })
  @ApiResponse({ status: 200, description: 'Email principal encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async findMainByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    return this.emailsService.findMainByAgency(agencyId);
  }

  @Get('count/total')
  @AllowRoles('superadmin', 'agency_admin')
  @ApiOperation({ summary: 'Contar emails da agência' })
  @ApiResponse({ status: 200, description: 'Contagem de emails' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Agência não encontrada' })
  async countByAgency(@Param('agencyId', ParseUUIDPipe) agencyId: string) {
    const count = await this.emailsService.countByAgency(agencyId);
    return { count };
  }
}
