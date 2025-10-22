import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsRepository } from './tenants.repository';

@Injectable()
export class TenantsService {
  constructor(private readonly tenantsRepository: TenantsRepository) {}

  async create(createTenantDto: CreateTenantDto) {
    // Verifica se o slug já existe
    const existingTenant = await this.tenantsRepository.findBySlug(
      createTenantDto.slug,
    );

    if (existingTenant) {
      throw new ConflictException(
        `Tenant com slug '${createTenantDto.slug}' já existe`,
      );
    }

    return await this.tenantsRepository.create(createTenantDto);
  }

  async findAll() {
    return await this.tenantsRepository.findAll();
  }

  async findOne(id: string) {
    const tenant = await this.tenantsRepository.findOne(id);

    if (!tenant) {
      throw new NotFoundException(`Tenant com ID '${id}' não encontrado`);
    }

    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.tenantsRepository.findBySlug(slug);

    if (!tenant) {
      throw new NotFoundException(`Tenant com slug '${slug}' não encontrado`);
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    // Verifica se o tenant existe
    await this.findOne(id);

    // Se está atualizando o slug, verifica se já existe
    if (updateTenantDto.slug) {
      const existingTenant = await this.tenantsRepository.findBySlug(
        updateTenantDto.slug,
      );

      if (existingTenant && existingTenant.id !== id) {
        throw new ConflictException(
          `Tenant com slug '${updateTenantDto.slug}' já existe`,
        );
      }
    }

    return await this.tenantsRepository.update(id, updateTenantDto);
  }

  async remove(id: string) {
    // Verifica se o tenant existe
    await this.findOne(id);

    return await this.tenantsRepository.remove(id);
  }
}
