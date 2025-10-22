import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  AgencySocialsRepository,
  AgencySocial,
} from './agency-socials.repository';
import { AgenciesRepository } from './agencies.repository';
import { CreateAgencySocialDto } from './dto/create-agency-social.dto';
import { UpdateAgencySocialDto } from './dto/create-agency-social.dto';

@Injectable()
export class AgencySocialsService {
  constructor(
    private readonly socialsRepository: AgencySocialsRepository,
    private readonly agenciesRepository: AgenciesRepository,
  ) {}

  async create(
    agencyId: string,
    createSocialDto: CreateAgencySocialDto,
  ): Promise<AgencySocial> {
    // Verificar se a agência existe
    const agency = await this.agenciesRepository.findOne(agencyId);
    if (!agency) {
      throw new NotFoundException('Agência não encontrada');
    }

    // Verificar se já existe um perfil deste tipo para a agência
    const existingSocial = await this.socialsRepository.findByTypeAndAgency(
      createSocialDto.type,
      agencyId,
    );
    if (existingSocial) {
      throw new ConflictException(
        `Já existe um perfil ${createSocialDto.type} para esta agência`,
      );
    }

    return this.socialsRepository.create(agencyId, createSocialDto);
  }

  async findAllByAgency(agencyId: string): Promise<AgencySocial[]> {
    // Verificar se a agência existe
    const agency = await this.agenciesRepository.findOne(agencyId);
    if (!agency) {
      throw new NotFoundException('Agência não encontrada');
    }

    return this.socialsRepository.findAllByAgency(agencyId);
  }

  async findActiveByAgency(agencyId: string): Promise<AgencySocial[]> {
    // Verificar se a agência existe
    const agency = await this.agenciesRepository.findOne(agencyId);
    if (!agency) {
      throw new NotFoundException('Agência não encontrada');
    }

    return this.socialsRepository.findAllByAgency(agencyId);
  }

  async findOne(id: string): Promise<AgencySocial> {
    const social = await this.socialsRepository.findOne(id);
    if (!social) {
      throw new NotFoundException('Rede social não encontrada');
    }
    return social;
  }

  async findOneByAgency(id: string, agencyId: string): Promise<AgencySocial> {
    const social = await this.socialsRepository.findOneByAgency(id, agencyId);
    if (!social) {
      throw new NotFoundException('Rede social não encontrada nesta agência');
    }
    return social;
  }

  async findByTypeAndAgency(
    type: string,
    agencyId: string,
  ): Promise<AgencySocial | null> {
    return this.socialsRepository.findByTypeAndAgency(type, agencyId);
  }

  async update(
    id: string,
    updateSocialDto: UpdateAgencySocialDto,
  ): Promise<AgencySocial> {
    // Verificar se a rede social existe
    const existingSocial = await this.socialsRepository.findOne(id);
    if (!existingSocial) {
      throw new NotFoundException('Rede social não encontrada');
    }

    // Verificar se já existe um perfil deste tipo para a agência (se está mudando o tipo)
    if (updateSocialDto.type && updateSocialDto.type !== existingSocial.type) {
      const existingType = await this.socialsRepository.findByTypeAndAgency(
        updateSocialDto.type,
        existingSocial.agencyId,
      );
      if (existingType) {
        throw new ConflictException(
          `Já existe um perfil ${updateSocialDto.type} para esta agência`,
        );
      }
    }

    const updatedSocial = await this.socialsRepository.update(
      id,
      updateSocialDto,
    );
    if (!updatedSocial) {
      throw new NotFoundException('Rede social não encontrada');
    }

    return updatedSocial;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateSocialDto: UpdateAgencySocialDto,
  ): Promise<AgencySocial> {
    // Verificar se a rede social existe na agência
    const existingSocial = await this.socialsRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!existingSocial) {
      throw new NotFoundException('Rede social não encontrada nesta agência');
    }

    // Verificar se já existe um perfil deste tipo para a agência (se está mudando o tipo)
    if (updateSocialDto.type && updateSocialDto.type !== existingSocial.type) {
      const existingType = await this.socialsRepository.findByTypeAndAgency(
        updateSocialDto.type,
        agencyId,
      );
      if (existingType) {
        throw new ConflictException(
          `Já existe um perfil ${updateSocialDto.type} para esta agência`,
        );
      }
    }

    const updatedSocial = await this.socialsRepository.updateByAgency(
      id,
      agencyId,
      updateSocialDto,
    );
    if (!updatedSocial) {
      throw new NotFoundException('Rede social não encontrada nesta agência');
    }

    return updatedSocial;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.socialsRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Rede social não encontrada');
    }
  }

  async removeByAgency(id: string, agencyId: string): Promise<void> {
    const deleted = await this.socialsRepository.removeByAgency(id, agencyId);
    if (!deleted) {
      throw new NotFoundException('Rede social não encontrada nesta agência');
    }
  }

  async countByAgency(agencyId: string): Promise<number> {
    return this.socialsRepository.countByAgency(agencyId);
  }
}
