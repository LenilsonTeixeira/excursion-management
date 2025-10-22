import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  TripCategoriesRepository,
  TripCategory,
} from './trip-categories.repository';
import { CreateTripCategoryDto } from './dto/create-trip-category.dto';
import { UpdateTripCategoryDto } from './dto/update-trip-category.dto';

@Injectable()
export class TripCategoriesService {
  constructor(
    private readonly tripCategoriesRepository: TripCategoriesRepository,
  ) {}

  async create(
    agencyId: string,
    createTripCategoryDto: CreateTripCategoryDto,
  ): Promise<TripCategory> {
    // Verificar se nome já existe na agência
    const existingCategory =
      await this.tripCategoriesRepository.findByNameAndAgency(
        createTripCategoryDto.name,
        agencyId,
      );
    if (existingCategory) {
      throw new ConflictException(
        'Nome da categoria já está em uso nesta agência',
      );
    }

    return this.tripCategoriesRepository.create(
      agencyId,
      createTripCategoryDto,
    );
  }

  async findAllByAgency(agencyId: string): Promise<TripCategory[]> {
    return this.tripCategoriesRepository.findAllByAgency(agencyId);
  }

  async findOne(id: string): Promise<TripCategory> {
    const tripCategory = await this.tripCategoriesRepository.findOne(id);
    if (!tripCategory) {
      throw new NotFoundException('Categoria de viagem não encontrada');
    }
    return tripCategory;
  }

  async findOneByAgency(id: string, agencyId: string): Promise<TripCategory> {
    const tripCategory = await this.tripCategoriesRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!tripCategory) {
      throw new NotFoundException(
        'Categoria de viagem não encontrada nesta agência',
      );
    }
    return tripCategory;
  }

  async update(
    id: string,
    updateTripCategoryDto: UpdateTripCategoryDto,
  ): Promise<TripCategory> {
    // Verificar se categoria existe
    const existingCategory = await this.tripCategoriesRepository.findOne(id);
    if (!existingCategory) {
      throw new NotFoundException('Categoria de viagem não encontrada');
    }

    // Verificar se nome já existe na agência (se está sendo atualizado)
    if (
      updateTripCategoryDto.name &&
      updateTripCategoryDto.name !== existingCategory.name
    ) {
      const existingName =
        await this.tripCategoriesRepository.findByNameAndAgency(
          updateTripCategoryDto.name,
          existingCategory.agencyId,
        );
      if (existingName) {
        throw new ConflictException(
          'Nome da categoria já está em uso nesta agência',
        );
      }
    }

    const updatedCategory = await this.tripCategoriesRepository.update(
      id,
      updateTripCategoryDto,
    );
    if (!updatedCategory) {
      throw new NotFoundException('Categoria de viagem não encontrada');
    }

    return updatedCategory;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateTripCategoryDto: UpdateTripCategoryDto,
  ): Promise<TripCategory> {
    // Verificar se categoria existe na agência
    const existingCategory =
      await this.tripCategoriesRepository.findOneByAgency(id, agencyId);
    if (!existingCategory) {
      throw new NotFoundException(
        'Categoria de viagem não encontrada nesta agência',
      );
    }

    // Verificar se nome já existe na agência (se está sendo atualizado)
    if (
      updateTripCategoryDto.name &&
      updateTripCategoryDto.name !== existingCategory.name
    ) {
      const existingName =
        await this.tripCategoriesRepository.findByNameAndAgency(
          updateTripCategoryDto.name,
          agencyId,
        );
      if (existingName) {
        throw new ConflictException(
          'Nome da categoria já está em uso nesta agência',
        );
      }
    }

    const updatedCategory = await this.tripCategoriesRepository.updateByAgency(
      id,
      agencyId,
      updateTripCategoryDto,
    );
    if (!updatedCategory) {
      throw new NotFoundException(
        'Categoria de viagem não encontrada nesta agência',
      );
    }

    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.tripCategoriesRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Categoria de viagem não encontrada');
    }
  }

  async removeByAgency(id: string, agencyId: string): Promise<void> {
    const deleted = await this.tripCategoriesRepository.removeByAgency(
      id,
      agencyId,
    );
    if (!deleted) {
      throw new NotFoundException(
        'Categoria de viagem não encontrada nesta agência',
      );
    }
  }

  async countByAgency(agencyId: string): Promise<number> {
    return this.tripCategoriesRepository.countByAgency(agencyId);
  }
}
