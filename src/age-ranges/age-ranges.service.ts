import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AgeRangesRepository, AgeRange } from './age-ranges.repository';
import { CreateAgeRangeDto } from './dto/create-age-range.dto';
import { UpdateAgeRangeDto } from './dto/update-age-range.dto';

@Injectable()
export class AgeRangesService {
  constructor(private readonly ageRangesRepository: AgeRangesRepository) {}

  async create(
    agencyId: string,
    createAgeRangeDto: CreateAgeRangeDto,
  ): Promise<AgeRange> {
    // Validar se minAge é menor que maxAge
    if (createAgeRangeDto.minAge >= createAgeRangeDto.maxAge) {
      throw new BadRequestException(
        'A idade mínima deve ser menor que a idade máxima',
      );
    }

    // Verificar se nome já existe na agência
    const existingAgeRange = await this.ageRangesRepository.findByNameAndAgency(
      createAgeRangeDto.name,
      agencyId,
    );
    if (existingAgeRange) {
      throw new ConflictException(
        'Nome da faixa etária já está em uso nesta agência',
      );
    }

    // Verificar sobreposição de faixas etárias
    await this.validateAgeRangeOverlap(
      agencyId,
      createAgeRangeDto.minAge,
      createAgeRangeDto.maxAge,
    );

    return this.ageRangesRepository.create(agencyId, createAgeRangeDto);
  }

  async findAllByAgency(agencyId: string): Promise<AgeRange[]> {
    return this.ageRangesRepository.findAllByAgency(agencyId);
  }

  async findOne(id: string): Promise<AgeRange> {
    const ageRange = await this.ageRangesRepository.findOne(id);
    if (!ageRange) {
      throw new NotFoundException('Faixa etária não encontrada');
    }
    return ageRange;
  }

  async findOneByAgency(id: string, agencyId: string): Promise<AgeRange> {
    const ageRange = await this.ageRangesRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!ageRange) {
      throw new NotFoundException('Faixa etária não encontrada nesta agência');
    }
    return ageRange;
  }

  async update(
    id: string,
    updateAgeRangeDto: UpdateAgeRangeDto,
  ): Promise<AgeRange> {
    // Verificar se faixa etária existe
    const existingAgeRange = await this.ageRangesRepository.findOne(id);
    if (!existingAgeRange) {
      throw new NotFoundException('Faixa etária não encontrada');
    }

    // Validar minAge e maxAge se estão sendo atualizados
    const minAge = updateAgeRangeDto.minAge ?? existingAgeRange.minAge;
    const maxAge = updateAgeRangeDto.maxAge ?? existingAgeRange.maxAge;

    if (minAge >= maxAge) {
      throw new BadRequestException(
        'A idade mínima deve ser menor que a idade máxima',
      );
    }

    // Verificar se nome já existe na agência (se está sendo atualizado)
    if (
      updateAgeRangeDto.name &&
      updateAgeRangeDto.name !== existingAgeRange.name
    ) {
      const existingName = await this.ageRangesRepository.findByNameAndAgency(
        updateAgeRangeDto.name,
        existingAgeRange.agencyId,
      );
      if (existingName) {
        throw new ConflictException(
          'Nome da faixa etária já está em uso nesta agência',
        );
      }
    }

    // Verificar sobreposição de faixas etárias (excluindo a própria faixa)
    await this.validateAgeRangeOverlap(
      existingAgeRange.agencyId,
      minAge,
      maxAge,
      id,
    );

    const updatedAgeRange = await this.ageRangesRepository.update(
      id,
      updateAgeRangeDto,
    );
    if (!updatedAgeRange) {
      throw new NotFoundException('Faixa etária não encontrada');
    }

    return updatedAgeRange;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateAgeRangeDto: UpdateAgeRangeDto,
  ): Promise<AgeRange> {
    // Verificar se faixa etária existe na agência
    const existingAgeRange = await this.ageRangesRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!existingAgeRange) {
      throw new NotFoundException('Faixa etária não encontrada nesta agência');
    }

    // Validar minAge e maxAge se estão sendo atualizados
    const minAge = updateAgeRangeDto.minAge ?? existingAgeRange.minAge;
    const maxAge = updateAgeRangeDto.maxAge ?? existingAgeRange.maxAge;

    if (minAge >= maxAge) {
      throw new BadRequestException(
        'A idade mínima deve ser menor que a idade máxima',
      );
    }

    // Verificar se nome já existe na agência (se está sendo atualizado)
    if (
      updateAgeRangeDto.name &&
      updateAgeRangeDto.name !== existingAgeRange.name
    ) {
      const existingName = await this.ageRangesRepository.findByNameAndAgency(
        updateAgeRangeDto.name,
        agencyId,
      );
      if (existingName) {
        throw new ConflictException(
          'Nome da faixa etária já está em uso nesta agência',
        );
      }
    }

    // Verificar sobreposição de faixas etárias (excluindo a própria faixa)
    await this.validateAgeRangeOverlap(agencyId, minAge, maxAge, id);

    const updatedAgeRange = await this.ageRangesRepository.updateByAgency(
      id,
      agencyId,
      updateAgeRangeDto,
    );
    if (!updatedAgeRange) {
      throw new NotFoundException('Faixa etária não encontrada nesta agência');
    }

    return updatedAgeRange;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.ageRangesRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Faixa etária não encontrada');
    }
  }

  async removeByAgency(id: string, agencyId: string): Promise<void> {
    const deleted = await this.ageRangesRepository.removeByAgency(id, agencyId);
    if (!deleted) {
      throw new NotFoundException('Faixa etária não encontrada nesta agência');
    }
  }

  async countByAgency(agencyId: string): Promise<number> {
    return this.ageRangesRepository.countByAgency(agencyId);
  }

  private async validateAgeRangeOverlap(
    agencyId: string,
    minAge: number,
    maxAge: number,
    excludeId?: string,
  ): Promise<void> {
    const existingAgeRanges =
      await this.ageRangesRepository.findAllByAgency(agencyId);

    for (const existingRange of existingAgeRanges) {
      // Pular a faixa que está sendo atualizada
      if (excludeId && existingRange.id === excludeId) {
        continue;
      }

      // Verificar sobreposição
      const hasOverlap =
        (minAge >= existingRange.minAge && minAge < existingRange.maxAge) ||
        (maxAge > existingRange.minAge && maxAge <= existingRange.maxAge) ||
        (minAge <= existingRange.minAge && maxAge >= existingRange.maxAge);

      if (hasOverlap) {
        throw new ConflictException(
          `A faixa etária sobrepõe com a faixa "${existingRange.name}" (${existingRange.minAge}-${existingRange.maxAge} anos)`,
        );
      }
    }
  }
}
