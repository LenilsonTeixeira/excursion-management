import { Test, TestingModule } from '@nestjs/testing';
import { TripCategoriesService } from './trip-categories.service';
import { TripCategoriesRepository } from './trip-categories.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateTripCategoryDto } from './dto/create-trip-category.dto';
import { UpdateTripCategoryDto } from './dto/update-trip-category.dto';

describe('TripCategoriesService', () => {
  let service: TripCategoriesService;
  let repository: TripCategoriesRepository;

  const mockTripCategory = {
    id: 'trip-category-id-1',
    name: 'Bate e Volta',
    agencyId: 'agency-id-1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCreateTripCategoryDto: CreateTripCategoryDto = {
    name: 'Bate e Volta',
  };

  const mockUpdateTripCategoryDto: UpdateTripCategoryDto = {
    name: 'Viagem com Hospedagem',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripCategoriesService,
        {
          provide: TripCategoriesRepository,
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

    service = module.get<TripCategoriesService>(TripCategoriesService);
    repository = module.get<TripCategoriesRepository>(TripCategoriesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a trip category successfully', async () => {
      jest.spyOn(repository, 'findByNameAndAgency').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(mockTripCategory);

      const result = await service.create(
        'agency-id-1',
        mockCreateTripCategoryDto,
      );

      expect(repository.findByNameAndAgency).toHaveBeenCalledWith(
        mockCreateTripCategoryDto.name,
        'agency-id-1',
      );
      expect(repository.create).toHaveBeenCalledWith(
        'agency-id-1',
        mockCreateTripCategoryDto,
      );
      expect(result).toEqual(mockTripCategory);
    });

    it('should throw ConflictException when name already exists in agency', async () => {
      jest
        .spyOn(repository, 'findByNameAndAgency')
        .mockResolvedValue(mockTripCategory);

      await expect(
        service.create('agency-id-1', mockCreateTripCategoryDto),
      ).rejects.toThrow(ConflictException);
      expect(repository.findByNameAndAgency).toHaveBeenCalledWith(
        mockCreateTripCategoryDto.name,
        'agency-id-1',
      );
    });
  });

  describe('findAllByAgency', () => {
    it('should return all trip categories for an agency', async () => {
      const tripCategories = [mockTripCategory];
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
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTripCategory);

      const result = await service.findOne('trip-category-id-1');

      expect(repository.findOne).toHaveBeenCalledWith('trip-category-id-1');
      expect(result).toEqual(mockTripCategory);
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
      jest
        .spyOn(repository, 'findOneByAgency')
        .mockResolvedValue(mockTripCategory);

      const result = await service.findOneByAgency(
        'trip-category-id-1',
        'agency-id-1',
      );

      expect(repository.findOneByAgency).toHaveBeenCalledWith(
        'trip-category-id-1',
        'agency-id-1',
      );
      expect(result).toEqual(mockTripCategory);
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
      const updatedTripCategory = {
        ...mockTripCategory,
        ...mockUpdateTripCategoryDto,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTripCategory);
      jest.spyOn(repository, 'findByNameAndAgency').mockResolvedValue(null);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedTripCategory);

      const result = await service.update(
        'trip-category-id-1',
        mockUpdateTripCategoryDto,
      );

      expect(repository.findOne).toHaveBeenCalledWith('trip-category-id-1');
      expect(repository.update).toHaveBeenCalledWith(
        'trip-category-id-1',
        mockUpdateTripCategoryDto,
      );
      expect(result).toEqual(updatedTripCategory);
    });

    it('should throw NotFoundException when trip category not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update('trip-category-id-1', mockUpdateTripCategoryDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when name already exists in agency', async () => {
      const updateDtoWithName = {
        ...mockUpdateTripCategoryDto,
        name: 'Nome Duplicado',
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTripCategory);
      jest
        .spyOn(repository, 'findByNameAndAgency')
        .mockResolvedValue(mockTripCategory);

      await expect(
        service.update('trip-category-id-1', updateDtoWithName),
      ).rejects.toThrow(ConflictException);
    });

    it('should not check name conflict when name is not being updated', async () => {
      const updateDtoWithoutName: UpdateTripCategoryDto = {};
      const updatedTripCategory = {
        ...mockTripCategory,
        ...updateDtoWithoutName,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTripCategory);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedTripCategory);

      const result = await service.update(
        'trip-category-id-1',
        updateDtoWithoutName,
      );

      expect(repository.findOne).toHaveBeenCalledWith('trip-category-id-1');
      expect(repository.update).toHaveBeenCalledWith(
        'trip-category-id-1',
        updateDtoWithoutName,
      );
      expect(result).toEqual(updatedTripCategory);
    });
  });

  describe('updateByAgency', () => {
    it('should update a trip category by agency successfully', async () => {
      const updatedTripCategory = {
        ...mockTripCategory,
        ...mockUpdateTripCategoryDto,
      };
      jest
        .spyOn(repository, 'findOneByAgency')
        .mockResolvedValue(mockTripCategory);
      jest.spyOn(repository, 'findByNameAndAgency').mockResolvedValue(null);
      jest
        .spyOn(repository, 'updateByAgency')
        .mockResolvedValue(updatedTripCategory);

      const result = await service.updateByAgency(
        'trip-category-id-1',
        'agency-id-1',
        mockUpdateTripCategoryDto,
      );

      expect(repository.findOneByAgency).toHaveBeenCalledWith(
        'trip-category-id-1',
        'agency-id-1',
      );
      expect(repository.updateByAgency).toHaveBeenCalledWith(
        'trip-category-id-1',
        'agency-id-1',
        mockUpdateTripCategoryDto,
      );
      expect(result).toEqual(updatedTripCategory);
    });

    it('should throw NotFoundException when trip category not found in agency', async () => {
      jest.spyOn(repository, 'findOneByAgency').mockResolvedValue(null);

      await expect(
        service.updateByAgency(
          'trip-category-id-1',
          'agency-id-1',
          mockUpdateTripCategoryDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when name already exists in agency', async () => {
      const updateDtoWithName = {
        ...mockUpdateTripCategoryDto,
        name: 'Nome Duplicado',
      };
      jest
        .spyOn(repository, 'findOneByAgency')
        .mockResolvedValue(mockTripCategory);
      jest
        .spyOn(repository, 'findByNameAndAgency')
        .mockResolvedValue(mockTripCategory);

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
