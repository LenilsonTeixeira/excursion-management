import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AgencyAddressesRepository,
  AgencyAddress,
} from './agency-addresses.repository';
import { AgenciesRepository } from './agencies.repository';
import { CreateAgencyAddressDto } from './dto/create-agency-address.dto';
import { UpdateAgencyAddressDto } from './dto/create-agency-address.dto';

@Injectable()
export class AgencyAddressesService {
  constructor(
    private readonly addressesRepository: AgencyAddressesRepository,
    private readonly agenciesRepository: AgenciesRepository,
  ) {}

  async create(
    agencyId: string,
    createAddressDto: CreateAgencyAddressDto,
  ): Promise<AgencyAddress> {
    // Verificar se a agência existe
    const agency = await this.agenciesRepository.findOne(agencyId);
    if (!agency) {
      throw new NotFoundException('Agência não encontrada');
    }

    // Criar o endereço
    return this.addressesRepository.create(agencyId, createAddressDto);
  }

  async findAllByAgency(agencyId: string): Promise<AgencyAddress[]> {
    // Verificar se a agência existe
    const agency = await this.agenciesRepository.findOne(agencyId);
    if (!agency) {
      throw new NotFoundException('Agência não encontrada');
    }

    return this.addressesRepository.findAllByAgency(agencyId);
  }

  async findOne(id: string): Promise<AgencyAddress> {
    const address = await this.addressesRepository.findOne(id);
    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }
    return address;
  }

  async findOneByAgency(id: string, agencyId: string): Promise<AgencyAddress> {
    const address = await this.addressesRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!address) {
      throw new NotFoundException('Endereço não encontrado nesta agência');
    }
    return address;
  }

  async findMainByAgency(agencyId: string): Promise<AgencyAddress | null> {
    // Como não há mais campo isMain, retornamos o primeiro endereço do tipo 'main'
    return this.addressesRepository.findByTypeAndAgency('main', agencyId);
  }

  async update(
    id: string,
    updateAddressDto: UpdateAgencyAddressDto,
  ): Promise<AgencyAddress> {
    // Verificar se o endereço existe
    const existingAddress = await this.addressesRepository.findOne(id);
    if (!existingAddress) {
      throw new NotFoundException('Endereço não encontrado');
    }

    // Se está marcando como principal, desmarcar outros

    const updatedAddress = await this.addressesRepository.update(
      id,
      updateAddressDto,
    );
    if (!updatedAddress) {
      throw new NotFoundException('Endereço não encontrado');
    }

    return updatedAddress;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateAddressDto: UpdateAgencyAddressDto,
  ): Promise<AgencyAddress> {
    // Verificar se o endereço existe na agência
    const existingAddress = await this.addressesRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!existingAddress) {
      throw new NotFoundException('Endereço não encontrado nesta agência');
    }

    // Se está marcando como principal, desmarcar outros

    const updatedAddress = await this.addressesRepository.updateByAgency(
      id,
      agencyId,
      updateAddressDto,
    );
    if (!updatedAddress) {
      throw new NotFoundException('Endereço não encontrado nesta agência');
    }

    return updatedAddress;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.addressesRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Endereço não encontrado');
    }
  }

  async removeByAgency(id: string, agencyId: string): Promise<void> {
    const deleted = await this.addressesRepository.removeByAgency(id, agencyId);
    if (!deleted) {
      throw new NotFoundException('Endereço não encontrado nesta agência');
    }
  }

  async countByAgency(agencyId: string): Promise<number> {
    return this.addressesRepository.countByAgency(agencyId);
  }
}
