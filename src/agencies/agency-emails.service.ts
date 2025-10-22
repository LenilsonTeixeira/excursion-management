import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  AgencyEmailsRepository,
  AgencyEmail,
} from './agency-emails.repository';
import { AgenciesRepository } from './agencies.repository';
import { CreateAgencyEmailDto } from './dto/create-agency-email.dto';
import { UpdateAgencyEmailDto } from './dto/create-agency-email.dto';

@Injectable()
export class AgencyEmailsService {
  constructor(
    private readonly emailsRepository: AgencyEmailsRepository,
    private readonly agenciesRepository: AgenciesRepository,
  ) {}

  async create(
    agencyId: string,
    createEmailDto: CreateAgencyEmailDto,
  ): Promise<AgencyEmail> {
    // Verificar se a agência existe
    const agency = await this.agenciesRepository.findOne(agencyId);
    if (!agency) {
      throw new NotFoundException('Agência não encontrada');
    }

    // Verificar se o email já existe
    const existingEmail = await this.emailsRepository.findByEmail(
      createEmailDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('Email já está em uso');
    }

    // Se está marcando como principal, desmarcar outros

    return this.emailsRepository.create(agencyId, createEmailDto);
  }

  async findAllByAgency(agencyId: string): Promise<AgencyEmail[]> {
    // Verificar se a agência existe
    const agency = await this.agenciesRepository.findOne(agencyId);
    if (!agency) {
      throw new NotFoundException('Agência não encontrada');
    }

    return this.emailsRepository.findAllByAgency(agencyId);
  }

  async findOne(id: string): Promise<AgencyEmail> {
    const email = await this.emailsRepository.findOne(id);
    if (!email) {
      throw new NotFoundException('Email não encontrado');
    }
    return email;
  }

  async findOneByAgency(id: string, agencyId: string): Promise<AgencyEmail> {
    const email = await this.emailsRepository.findOneByAgency(id, agencyId);
    if (!email) {
      throw new NotFoundException('Email não encontrado nesta agência');
    }
    return email;
  }

  async findMainByAgency(agencyId: string): Promise<AgencyEmail | null> {
    // Como não há mais campo isMain, retornamos o primeiro email do tipo 'main'
    return this.emailsRepository.findByTypeAndAgency('main', agencyId);
  }

  async update(
    id: string,
    updateEmailDto: UpdateAgencyEmailDto,
  ): Promise<AgencyEmail> {
    // Verificar se o email existe
    const existingEmail = await this.emailsRepository.findOne(id);
    if (!existingEmail) {
      throw new NotFoundException('Email não encontrado');
    }

    // Verificar se o email já existe (se está sendo atualizado)
    if (updateEmailDto.email && updateEmailDto.email !== existingEmail.email) {
      const existingEmailAddress = await this.emailsRepository.findByEmail(
        updateEmailDto.email,
      );
      if (existingEmailAddress) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Se está marcando como principal, desmarcar outros

    const updatedEmail = await this.emailsRepository.update(id, updateEmailDto);
    if (!updatedEmail) {
      throw new NotFoundException('Email não encontrado');
    }

    return updatedEmail;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateEmailDto: UpdateAgencyEmailDto,
  ): Promise<AgencyEmail> {
    // Verificar se o email existe na agência
    const existingEmail = await this.emailsRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!existingEmail) {
      throw new NotFoundException('Email não encontrado nesta agência');
    }

    // Verificar se o email já existe (se está sendo atualizado)
    if (updateEmailDto.email && updateEmailDto.email !== existingEmail.email) {
      const existingEmailAddress = await this.emailsRepository.findByEmail(
        updateEmailDto.email,
      );
      if (existingEmailAddress) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Se está marcando como principal, desmarcar outros

    const updatedEmail = await this.emailsRepository.updateByAgency(
      id,
      agencyId,
      updateEmailDto,
    );
    if (!updatedEmail) {
      throw new NotFoundException('Email não encontrado nesta agência');
    }

    return updatedEmail;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.emailsRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Email não encontrado');
    }
  }

  async removeByAgency(id: string, agencyId: string): Promise<void> {
    const deleted = await this.emailsRepository.removeByAgency(id, agencyId);
    if (!deleted) {
      throw new NotFoundException('Email não encontrado nesta agência');
    }
  }

  async countByAgency(agencyId: string): Promise<number> {
    return this.emailsRepository.countByAgency(agencyId);
  }
}
