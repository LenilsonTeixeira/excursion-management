import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AgeRangesService } from './age-ranges.service';
import { AgeRangesRepository, AgeRange } from './age-ranges.repository';
import { CreateAgeRangeDto } from './dto/create-age-range.dto';
import { UpdateAgeRangeDto } from './dto/update-age-range.dto';

describe('AgeRangesService', () => {
  let service: AgeRangesService;
  let repository: jest.Mocked<AgeRangesRepository>;

  const mockAgeRange: AgeRange = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Adulto',
    minAge: 18,
    maxAge: 65,
    occupiesSeat: true,
    agencyId: '123e4567-e89b-12d3-a456-426614174001',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockCreateDto: CreateAgeRangeDto = {
    name: 'Adulto',
    minAge: 18,
    maxAge: 65,
    occupiesSeat: true,
  };

  const mockUpdateDto: UpdateAgeRangeDto = {
    name: 'Adulto Atualizado',
  };

  beforeEach(async () => {
    const mockRepository = {
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgeRangesService,
        {
          provide: AgeRangesRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AgeRangesService>(AgeRangesService);
    repository = module.get(AgeRangesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new age range successfully', async () => {
      repository.findByNameAndAgency.mockResolvedValue(null);
      repository.findAllByAgency.mockResolvedValue([]);
      repository.create.mockResolvedValue(mockAgeRange);

      const result = await service.create('agency-id', mockCreateDto);

      expect(result).toEqual(mockAgeRange);
      expect(repository.findByNameAndAgency).toHaveBeenCalledWith(
        mockCreateDto.name,
        'agency-id',
      );
      expect(repository.create).toHaveBeenCalledWith(
        'agency-id',
        mockCreateDto,
      );
    });

    it('should throw BadRequestException when minAge >= maxAge', async () => {
      const invalidDto = { ...mockCreateDto, minAge: 65, maxAge: 18 };

      await expect(service.create('agency-id', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when name already exists', async () => {
      repository.findByNameAndAgency.mockResolvedValue(mockAgeRange);

      await expect(service.create('agency-id', mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when age ranges overlap', async () => {
      repository.findByNameAndAgency.mockResolvedValue(null);
      repository.findAllByAgency.mockResolvedValue([
        { ...mockAgeRange, minAge: 20, maxAge: 30 },
      ]);

      await expect(service.create('agency-id', mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllByAgency', () => {
    it('should return all age ranges for an agency', async () => {
      const ageRanges = [mockAgeRange];
      repository.findAllByAgency.mockResolvedValue(ageRanges);

      const result = await service.findAllByAgency('agency-id');

      expect(result).toEqual(ageRanges);
      expect(repository.findAllByAgency).toHaveBeenCalledWith('agency-id');
    });
  });

  describe('findOne', () => {
    it('should return an age range by id', async () => {
      repository.findOne.mockResolvedValue(mockAgeRange);

      const result = await service.findOne('age-range-id');

      expect(result).toEqual(mockAgeRange);
      expect(repository.findOne).toHaveBeenCalledWith('age-range-id');
    });

    it('should throw NotFoundException when age range not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('age-range-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByAgency', () => {
    it('should return an age range by id and agency', async () => {
      repository.findOneByAgency.mockResolvedValue(mockAgeRange);

      const result = await service.findOneByAgency('age-range-id', 'agency-id');

      expect(result).toEqual(mockAgeRange);
      expect(repository.findOneByAgency).toHaveBeenCalledWith(
        'age-range-id',
        'agency-id',
      );
    });

    it('should throw NotFoundException when age range not found in agency', async () => {
      repository.findOneByAgency.mockResolvedValue(null);

      await expect(
        service.findOneByAgency('age-range-id', 'agency-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an age range successfully', async () => {
      repository.findOne.mockResolvedValue(mockAgeRange);
      repository.findByNameAndAgency.mockResolvedValue(null);
      repository.findAllByAgency.mockResolvedValue([]);
      repository.update.mockResolvedValue({
        ...mockAgeRange,
        ...mockUpdateDto,
      });

      const result = await service.update('age-range-id', mockUpdateDto);

      expect(result).toEqual({ ...mockAgeRange, ...mockUpdateDto });
      expect(repository.update).toHaveBeenCalledWith(
        'age-range-id',
        mockUpdateDto,
      );
    });

    it('should throw NotFoundException when age range not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('age-range-id', mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when minAge >= maxAge', async () => {
      repository.findOne.mockResolvedValue(mockAgeRange);
      const invalidDto = { minAge: 65, maxAge: 18 };

      await expect(service.update('age-range-id', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateByAgency', () => {
    it('should update an age range by agency successfully', async () => {
      repository.findOneByAgency.mockResolvedValue(mockAgeRange);
      repository.findByNameAndAgency.mockResolvedValue(null);
      repository.findAllByAgency.mockResolvedValue([]);
      repository.updateByAgency.mockResolvedValue({
        ...mockAgeRange,
        ...mockUpdateDto,
      });

      const result = await service.updateByAgency(
        'age-range-id',
        'agency-id',
        mockUpdateDto,
      );

      expect(result).toEqual({ ...mockAgeRange, ...mockUpdateDto });
      expect(repository.updateByAgency).toHaveBeenCalledWith(
        'age-range-id',
        'agency-id',
        mockUpdateDto,
      );
    });

    it('should throw NotFoundException when age range not found in agency', async () => {
      repository.findOneByAgency.mockResolvedValue(null);

      await expect(
        service.updateByAgency('age-range-id', 'agency-id', mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an age range successfully', async () => {
      repository.remove.mockResolvedValue(true);

      await service.remove('age-range-id');

      expect(repository.remove).toHaveBeenCalledWith('age-range-id');
    });

    it('should throw NotFoundException when age range not found', async () => {
      repository.remove.mockResolvedValue(false);

      await expect(service.remove('age-range-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeByAgency', () => {
    it('should remove an age range by agency successfully', async () => {
      repository.removeByAgency.mockResolvedValue(true);

      await service.removeByAgency('age-range-id', 'agency-id');

      expect(repository.removeByAgency).toHaveBeenCalledWith(
        'age-range-id',
        'agency-id',
      );
    });

    it('should throw NotFoundException when age range not found in agency', async () => {
      repository.removeByAgency.mockResolvedValue(false);

      await expect(
        service.removeByAgency('age-range-id', 'agency-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('countByAgency', () => {
    it('should return count of age ranges for an agency', async () => {
      repository.countByAgency.mockResolvedValue(5);

      const result = await service.countByAgency('agency-id');

      expect(result).toBe(5);
      expect(repository.countByAgency).toHaveBeenCalledWith('agency-id');
    });
  });
});
