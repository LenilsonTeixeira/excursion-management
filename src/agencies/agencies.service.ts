import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AgenciesRepository, Agency } from './agencies.repository';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';

@Injectable()
export class AgenciesService {
  constructor(private readonly agenciesRepository: AgenciesRepository) {}

  async create(
    tenantId: string,
    createAgencyDto: CreateAgencyDto,
  ): Promise<Agency> {
    // Verificar se CADASTUR já existe
    const existingCadastur = await this.agenciesRepository.findByCadastur(
      createAgencyDto.cadastur,
    );
    if (existingCadastur) {
      throw new ConflictException('CADASTUR já está em uso por outra agência');
    }

    // Verificar se CNPJ já existe
    const existingCnpj = await this.agenciesRepository.findByCnpj(
      createAgencyDto.cnpj,
    );
    if (existingCnpj) {
      throw new ConflictException('CNPJ já está em uso por outra agência');
    }

    return this.agenciesRepository.create(tenantId, createAgencyDto);
  }

  async findAllByTenant(tenantId: string): Promise<Agency[]> {
    return this.agenciesRepository.findAllByTenant(tenantId);
  }

  async findOne(id: string): Promise<Agency> {
    const agency = await this.agenciesRepository.findOne(id);
    if (!agency) {
      throw new NotFoundException('Agência não encontrada');
    }
    return agency;
  }

  async findOneByTenant(id: string, tenantId: string): Promise<Agency> {
    const agency = await this.agenciesRepository.findOneByTenant(id, tenantId);
    if (!agency) {
      throw new NotFoundException('Agência não encontrada neste tenant');
    }
    return agency;
  }

  async update(id: string, updateAgencyDto: UpdateAgencyDto): Promise<Agency> {
    // Verificar se agência existe
    const existingAgency = await this.agenciesRepository.findOne(id);
    if (!existingAgency) {
      throw new NotFoundException('Agência não encontrada');
    }

    // Verificar se CADASTUR já existe (se está sendo atualizado)
    if (
      updateAgencyDto.cadastur &&
      updateAgencyDto.cadastur !== existingAgency.cadastur
    ) {
      const existingCadastur = await this.agenciesRepository.findByCadastur(
        updateAgencyDto.cadastur,
      );
      if (existingCadastur) {
        throw new ConflictException(
          'CADASTUR já está em uso por outra agência',
        );
      }
    }

    // Verificar se CNPJ já existe (se está sendo atualizado)
    if (updateAgencyDto.cnpj && updateAgencyDto.cnpj !== existingAgency.cnpj) {
      const existingCnpj = await this.agenciesRepository.findByCnpj(
        updateAgencyDto.cnpj,
      );
      if (existingCnpj) {
        throw new ConflictException('CNPJ já está em uso por outra agência');
      }
    }

    const updatedAgency = await this.agenciesRepository.update(
      id,
      updateAgencyDto,
    );
    if (!updatedAgency) {
      throw new NotFoundException('Agência não encontrada');
    }

    return updatedAgency;
  }

  async updateByTenant(
    id: string,
    tenantId: string,
    updateAgencyDto: UpdateAgencyDto,
  ): Promise<Agency> {
    // Verificar se agência existe no tenant
    const existingAgency = await this.agenciesRepository.findOneByTenant(
      id,
      tenantId,
    );
    if (!existingAgency) {
      throw new NotFoundException('Agência não encontrada neste tenant');
    }

    // Verificar se CADASTUR já existe (se está sendo atualizado)
    if (
      updateAgencyDto.cadastur &&
      updateAgencyDto.cadastur !== existingAgency.cadastur
    ) {
      const existingCadastur = await this.agenciesRepository.findByCadastur(
        updateAgencyDto.cadastur,
      );
      if (existingCadastur) {
        throw new ConflictException(
          'CADASTUR já está em uso por outra agência',
        );
      }
    }

    // Verificar se CNPJ já existe (se está sendo atualizado)
    if (updateAgencyDto.cnpj && updateAgencyDto.cnpj !== existingAgency.cnpj) {
      const existingCnpj = await this.agenciesRepository.findByCnpj(
        updateAgencyDto.cnpj,
      );
      if (existingCnpj) {
        throw new ConflictException('CNPJ já está em uso por outra agência');
      }
    }

    const updatedAgency = await this.agenciesRepository.updateByTenant(
      id,
      tenantId,
      updateAgencyDto,
    );
    if (!updatedAgency) {
      throw new NotFoundException('Agência não encontrada neste tenant');
    }

    return updatedAgency;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.agenciesRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Agência não encontrada');
    }
  }

  async removeByTenant(id: string, tenantId: string): Promise<void> {
    const deleted = await this.agenciesRepository.removeByTenant(id, tenantId);
    if (!deleted) {
      throw new NotFoundException('Agência não encontrada neste tenant');
    }
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.agenciesRepository.countByTenant(tenantId);
  }
}
