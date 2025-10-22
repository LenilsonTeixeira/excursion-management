import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { NoTenantRequired } from '../common/decorators/requires-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('tenants')
@Controller('/admin/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Public()
  @NoTenantRequired()
  @ApiOperation({ summary: 'Criar um novo tenant' })
  @ApiResponse({
    status: 201,
    description: 'Tenant criado com sucesso',
  })
  @ApiResponse({
    status: 409,
    description: 'Tenant com esse slug já existe',
  })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os tenants' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tenants retornada com sucesso',
  })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Buscar um tenant pelo slug' })
  @ApiResponse({
    status: 200,
    description: 'Tenant encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um tenant pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Tenant com esse slug já existe',
  })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Remover um tenant' })
  @ApiResponse({
    status: 204,
    description: 'Tenant removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
