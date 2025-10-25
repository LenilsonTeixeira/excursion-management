import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriesRepository, Category } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(
    agencyId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    // Verificar se nome já existe na agência
    const existingCategory =
      await this.categoriesRepository.findByNameAndAgency(
        createCategoryDto.name,
        agencyId,
      );
    if (existingCategory) {
      throw new ConflictException(
        'Nome da categoria já está em uso nesta agência',
      );
    }

    return this.categoriesRepository.create(agencyId, createCategoryDto);
  }

  async findAllByAgency(agencyId: string): Promise<Category[]> {
    return this.categoriesRepository.findAllByAgency(agencyId);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne(id);
    if (!category) {
      throw new NotFoundException('Categoria de viagem não encontrada');
    }
    return category;
  }

  async findOneByAgency(id: string, agencyId: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!category) {
      throw new NotFoundException(
        'Categoria de viagem não encontrada nesta agência',
      );
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Verificar se categoria existe
    const existingCategory = await this.categoriesRepository.findOne(id);
    if (!existingCategory) {
      throw new NotFoundException('Categoria de viagem não encontrada');
    }

    // Verificar se nome já existe na agência (se está sendo atualizado)
    if (
      updateCategoryDto.name &&
      updateCategoryDto.name !== existingCategory.name
    ) {
      const existingName = await this.categoriesRepository.findByNameAndAgency(
        updateCategoryDto.name,
        existingCategory.agencyId,
      );
      if (existingName) {
        throw new ConflictException(
          'Nome da categoria já está em uso nesta agência',
        );
      }
    }

    const updatedCategory = await this.categoriesRepository.update(
      id,
      updateCategoryDto,
    );
    if (!updatedCategory) {
      throw new NotFoundException('Categoria de viagem não encontrada');
    }

    return updatedCategory;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Verificar se categoria existe na agência
    const existingCategory = await this.categoriesRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!existingCategory) {
      throw new NotFoundException(
        'Categoria de viagem não encontrada nesta agência',
      );
    }

    // Verificar se nome já existe na agência (se está sendo atualizado)
    if (
      updateCategoryDto.name &&
      updateCategoryDto.name !== existingCategory.name
    ) {
      const existingName = await this.categoriesRepository.findByNameAndAgency(
        updateCategoryDto.name,
        agencyId,
      );
      if (existingName) {
        throw new ConflictException(
          'Nome da categoria já está em uso nesta agência',
        );
      }
    }

    const updatedCategory = await this.categoriesRepository.updateByAgency(
      id,
      agencyId,
      updateCategoryDto,
    );
    if (!updatedCategory) {
      throw new NotFoundException(
        'Categoria de viagem não encontrada nesta agência',
      );
    }

    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.categoriesRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Categoria de viagem não encontrada');
    }
  }

  async removeByAgency(id: string, agencyId: string): Promise<void> {
    const deleted = await this.categoriesRepository.removeByAgency(
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
    return this.categoriesRepository.countByAgency(agencyId);
  }
}
