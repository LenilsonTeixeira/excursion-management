import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: CategoriesRepository;

  const mockCategory = {
    id: 'trip-category-id-1',
    name: 'Bate e Volta',
    agencyId: 'agency-id-1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCreateCategoryDto: CreateCategoryDto = {
    name: 'Bate e Volta',
  };

  const mockUpdateCategoryDto: UpdateCategoryDto = {
    name: 'Viagem com Hospedagem',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: {
            create: jest.fn(),
            findAllByAgency: jest.fn(),
            findOne: jest.fn(),
            findOneByAgency: jest.fn(),
            findByNameAndAgency: jest.fn(),
            update: jest.fn(),
            updateByAgency: jest.fn(),
            remove: jest.fn(),
            removeByAgency: jest.fn(),
            countByAgency: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<CategoriesRepository>(CategoriesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a trip category successfully', async () => {
      jest.spyOn(repository, 'findByNameAndAgency').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(mockCategory);

      const result = await service.create('agency-id-1', mockCreateCategoryDto);

      expect(repository.findByNameAndAgency).toHaveBeenCalledWith(
        mockCreateCategoryDto.name,
        'agency-id-1',
      );
      expect(repository.create).toHaveBeenCalledWith(
        'agency-id-1',
        mockCreateCategoryDto,
      );
      expect(result).toEqual(mockCategory);
    });

    it('should throw ConflictException when name already exists in agency', async () => {
      jest
        .spyOn(repository, 'findByNameAndAgency')
        .mockResolvedValue(mockCategory);

      await expect(
        service.create('agency-id-1', mockCreateCategoryDto),
      ).rejects.toThrow(ConflictException);
      expect(repository.findByNameAndAgency).toHaveBeenCalledWith(
        mockCreateCategoryDto.name,
        'agency-id-1',
      );
    });
  });

  describe('findAllByAgency', () => {
    it('should return all trip categories for an agency', async () => {
      const tripCategories = [mockCategory];
      jest
        .spyOn(repository, 'findAllByAgency')
        .mockResolvedValue(tripCategories);

      const result = await service.findAllByAgency('agency-id-1');

      expect(repository.findAllByAgency).toHaveBeenCalledWith('agency-id-1');
      expect(result).toEqual(tripCategories);
    });
  });

  describe('findOne', () => {
    it('should return a trip category by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCategory);

      const result = await service.findOne('trip-category-id-1');

      expect(repository.findOne).toHaveBeenCalledWith('trip-category-id-1');
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when trip category not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('trip-category-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByAgency', () => {
    it('should return a trip category by id and agency', async () => {
      jest.spyOn(repository, 'findOneByAgency').mockResolvedValue(mockCategory);

      const result = await service.findOneByAgency(
        'trip-category-id-1',
        'agency-id-1',
      );

      expect(repository.findOneByAgency).toHaveBeenCalledWith(
        'trip-category-id-1',
        'agency-id-1',
      );
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when trip category not found in agency', async () => {
      jest.spyOn(repository, 'findOneByAgency').mockResolvedValue(null);

      await expect(
        service.findOneByAgency('trip-category-id-1', 'agency-id-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a trip category successfully', async () => {
      const updatedCategory = {
        ...mockCategory,
        ...mockUpdateCategoryDto,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCategory);
      jest.spyOn(repository, 'findByNameAndAgency').mockResolvedValue(null);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedCategory);

      const result = await service.update(
        'trip-category-id-1',
        mockUpdateCategoryDto,
      );

      expect(repository.findOne).toHaveBeenCalledWith('trip-category-id-1');
      expect(repository.update).toHaveBeenCalledWith(
        'trip-category-id-1',
        mockUpdateCategoryDto,
      );
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException when trip category not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update('trip-category-id-1', mockUpdateCategoryDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when name already exists in agency', async () => {
      const updateDtoWithName = {
        ...mockUpdateCategoryDto,
        name: 'Nome Duplicado',
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCategory);
      jest
        .spyOn(repository, 'findByNameAndAgency')
        .mockResolvedValue(mockCategory);

      await expect(
        service.update('trip-category-id-1', updateDtoWithName),
      ).rejects.toThrow(ConflictException);
    });

    it('should not check name conflict when name is not being updated', async () => {
      const updateDtoWithoutName: UpdateCategoryDto = {};
      const updatedCategory = {
        ...mockCategory,
        ...updateDtoWithoutName,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCategory);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedCategory);

      const result = await service.update(
        'trip-category-id-1',
        updateDtoWithoutName,
      );

      expect(repository.findOne).toHaveBeenCalledWith('trip-category-id-1');
      expect(repository.update).toHaveBeenCalledWith(
        'trip-category-id-1',
        updateDtoWithoutName,
      );
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('updateByAgency', () => {
    it('should update a trip category by agency successfully', async () => {
      const updatedCategory = {
        ...mockCategory,
        ...mockUpdateCategoryDto,
      };
      jest.spyOn(repository, 'findOneByAgency').mockResolvedValue(mockCategory);
      jest.spyOn(repository, 'findByNameAndAgency').mockResolvedValue(null);
      jest
        .spyOn(repository, 'updateByAgency')
        .mockResolvedValue(updatedCategory);

      const result = await service.updateByAgency(
        'trip-category-id-1',
        'agency-id-1',
        mockUpdateCategoryDto,
      );

      expect(repository.findOneByAgency).toHaveBeenCalledWith(
        'trip-category-id-1',
        'agency-id-1',
      );
      expect(repository.updateByAgency).toHaveBeenCalledWith(
        'trip-category-id-1',
        'agency-id-1',
        mockUpdateCategoryDto,
      );
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException when trip category not found in agency', async () => {
      jest.spyOn(repository, 'findOneByAgency').mockResolvedValue(null);

      await expect(
        service.updateByAgency(
          'trip-category-id-1',
          'agency-id-1',
          mockUpdateCategoryDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when name already exists in agency', async () => {
      const updateDtoWithName = {
        ...mockUpdateCategoryDto,
        name: 'Nome Duplicado',
      };
      jest.spyOn(repository, 'findOneByAgency').mockResolvedValue(mockCategory);
      jest
        .spyOn(repository, 'findByNameAndAgency')
        .mockResolvedValue(mockCategory);

      await expect(
        service.updateByAgency(
          'trip-category-id-1',
          'agency-id-1',
          updateDtoWithName,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a trip category successfully', async () => {
      jest.spyOn(repository, 'remove').mockResolvedValue(true);

      await service.remove('trip-category-id-1');

      expect(repository.remove).toHaveBeenCalledWith('trip-category-id-1');
    });

    it('should throw NotFoundException when trip category not found', async () => {
      jest.spyOn(repository, 'remove').mockResolvedValue(false);

      await expect(service.remove('trip-category-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeByAgency', () => {
    it('should remove a trip category by agency successfully', async () => {
      jest.spyOn(repository, 'removeByAgency').mockResolvedValue(true);

      await service.removeByAgency('trip-category-id-1', 'agency-id-1');

      expect(repository.removeByAgency).toHaveBeenCalledWith(
        'trip-category-id-1',
        'agency-id-1',
      );
    });

    it('should throw NotFoundException when trip category not found in agency', async () => {
      jest.spyOn(repository, 'removeByAgency').mockResolvedValue(false);

      await expect(
        service.removeByAgency('trip-category-id-1', 'agency-id-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('countByAgency', () => {
    it('should return count of trip categories for an agency', async () => {
      jest.spyOn(repository, 'countByAgency').mockResolvedValue(3);

      const result = await service.countByAgency('agency-id-1');

      expect(repository.countByAgency).toHaveBeenCalledWith('agency-id-1');
      expect(result).toBe(3);
    });
  });
});
