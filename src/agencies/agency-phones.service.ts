import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  AgencyPhonesRepository,
  AgencyPhone,
} from './agency-phones.repository';
import { AgenciesRepository } from './agencies.repository';
import { CreateAgencyPhoneDto } from './dto/create-agency-phone.dto';
import { UpdateAgencyPhoneDto } from './dto/create-agency-phone.dto';

@Injectable()
export class AgencyPhonesService {
  constructor(
    private readonly phonesRepository: AgencyPhonesRepository,
    private readonly agenciesRepository: AgenciesRepository,
  ) {}

  async create(
    agencyId: string,
    createPhoneDto: CreateAgencyPhoneDto,
  ): Promise<AgencyPhone> {
    // Verificar se a agência existe
    const agency = await this.agenciesRepository.findOne(agencyId);
    if (!agency) {
      throw new NotFoundException('Agência não encontrada');
    }

    // Verificar se o número já existe
    const existingPhone = await this.phonesRepository.findByNumber(
      createPhoneDto.number,
    );
    if (existingPhone) {
      throw new ConflictException('Número de telefone já está em uso');
    }

    // Se está marcando como principal, desmarcar outros

    return this.phonesRepository.create(agencyId, createPhoneDto);
  }

  async findAllByAgency(agencyId: string): Promise<AgencyPhone[]> {
    // Verificar se a agência existe
    const agency = await this.agenciesRepository.findOne(agencyId);
    if (!agency) {
      throw new NotFoundException('Agência não encontrada');
    }

    return this.phonesRepository.findAllByAgency(agencyId);
  }

  async findOne(id: string): Promise<AgencyPhone> {
    const phone = await this.phonesRepository.findOne(id);
    if (!phone) {
      throw new NotFoundException('Telefone não encontrado');
    }
    return phone;
  }

  async findOneByAgency(id: string, agencyId: string): Promise<AgencyPhone> {
    const phone = await this.phonesRepository.findOneByAgency(id, agencyId);
    if (!phone) {
      throw new NotFoundException('Telefone não encontrado nesta agência');
    }
    return phone;
  }

  async findMainByAgency(agencyId: string): Promise<AgencyPhone | null> {
    // Como não há mais campo isMain, retornamos o primeiro telefone do tipo 'main'
    return this.phonesRepository.findByTypeAndAgency('main', agencyId);
  }

  async update(
    id: string,
    updatePhoneDto: UpdateAgencyPhoneDto,
  ): Promise<AgencyPhone> {
    // Verificar se o telefone existe
    const existingPhone = await this.phonesRepository.findOne(id);
    if (!existingPhone) {
      throw new NotFoundException('Telefone não encontrado');
    }

    // Verificar se o número já existe (se está sendo atualizado)
    if (
      updatePhoneDto.number &&
      updatePhoneDto.number !== existingPhone.number
    ) {
      const existingNumber = await this.phonesRepository.findByNumber(
        updatePhoneDto.number,
      );
      if (existingNumber) {
        throw new ConflictException('Número de telefone já está em uso');
      }
    }

    // Se está marcando como principal, desmarcar outros

    const updatedPhone = await this.phonesRepository.update(id, updatePhoneDto);
    if (!updatedPhone) {
      throw new NotFoundException('Telefone não encontrado');
    }

    return updatedPhone;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updatePhoneDto: UpdateAgencyPhoneDto,
  ): Promise<AgencyPhone> {
    // Verificar se o telefone existe na agência
    const existingPhone = await this.phonesRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!existingPhone) {
      throw new NotFoundException('Telefone não encontrado nesta agência');
    }

    // Verificar se o número já existe (se está sendo atualizado)
    if (
      updatePhoneDto.number &&
      updatePhoneDto.number !== existingPhone.number
    ) {
      const existingNumber = await this.phonesRepository.findByNumber(
        updatePhoneDto.number,
      );
      if (existingNumber) {
        throw new ConflictException('Número de telefone já está em uso');
      }
    }

    // Se está marcando como principal, desmarcar outros

    const updatedPhone = await this.phonesRepository.updateByAgency(
      id,
      agencyId,
      updatePhoneDto,
    );
    if (!updatedPhone) {
      throw new NotFoundException('Telefone não encontrado nesta agência');
    }

    return updatedPhone;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.phonesRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Telefone não encontrado');
    }
  }

  async removeByAgency(id: string, agencyId: string): Promise<void> {
    const deleted = await this.phonesRepository.removeByAgency(id, agencyId);
    if (!deleted) {
      throw new NotFoundException('Telefone não encontrado nesta agência');
    }
  }

  async countByAgency(agencyId: string): Promise<number> {
    return this.phonesRepository.countByAgency(agencyId);
  }
}
