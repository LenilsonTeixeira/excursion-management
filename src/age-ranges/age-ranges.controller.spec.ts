import { Test, TestingModule } from '@nestjs/testing';
import { AgeRangesController } from './age-ranges.controller';
import { AgeRangesService } from './age-ranges.service';
import { CreateAgeRangeDto } from './dto/create-age-range.dto';
import { UpdateAgeRangeDto } from './dto/update-age-range.dto';
import { AgeRange } from './age-ranges.repository';

describe('AgeRangesController', () => {
  let controller: AgeRangesController;
  let service: jest.Mocked<AgeRangesService>;

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

  const mockUser = {
    sub: 'user-id',
    id: 'user-id',
    email: 'test@example.com',
    role: 'agency_admin',
    agencyId: 'agency-id',
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAllByAgency: jest.fn(),
      findOne: jest.fn(),
      findOneByAgency: jest.fn(),
      update: jest.fn(),
      updateByAgency: jest.fn(),
      remove: jest.fn(),
      removeByAgency: jest.fn(),
      countByAgency: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgeRangesController],
      providers: [
        {
          provide: AgeRangesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AgeRangesController>(AgeRangesController);
    service = module.get(AgeRangesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new age range', async () => {
      service.create.mockResolvedValue(mockAgeRange);

      const result = await controller.create('agency-id', mockCreateDto);

      expect(result).toEqual(mockAgeRange);
      expect(service.create).toHaveBeenCalledWith('agency-id', mockCreateDto);
    });
  });

  describe('findAllByAgency', () => {
    it('should return all age ranges for an agency', async () => {
      const ageRanges = [mockAgeRange];
      service.findAllByAgency.mockResolvedValue(ageRanges);

      const result = await controller.findAllByAgency('agency-id');

      expect(result).toEqual(ageRanges);
      expect(service.findAllByAgency).toHaveBeenCalledWith('agency-id');
    });
  });

  describe('findOne', () => {
    it('should return an age range for superadmin', async () => {
      service.findOne.mockResolvedValue(mockAgeRange);
      const superadminUser = { ...mockUser, role: 'superadmin' };

      const result = await controller.findOne(
        'agency-id',
        'age-range-id',
        superadminUser,
      );

      expect(result).toEqual(mockAgeRange);
      expect(service.findOne).toHaveBeenCalledWith('age-range-id');
    });

    it('should return an age range for agency_admin', async () => {
      service.findOneByAgency.mockResolvedValue(mockAgeRange);

      const result = await controller.findOne(
        'agency-id',
        'age-range-id',
        mockUser,
      );

      expect(result).toEqual(mockAgeRange);
      expect(service.findOneByAgency).toHaveBeenCalledWith(
        'age-range-id',
        'agency-id',
      );
    });
  });

  describe('update', () => {
    it('should update an age range for superadmin', async () => {
      const updatedAgeRange = { ...mockAgeRange, ...mockUpdateDto };
      service.update.mockResolvedValue(updatedAgeRange);
      const superadminUser = { ...mockUser, role: 'superadmin' };

      const result = await controller.update(
        'agency-id',
        'age-range-id',
        mockUpdateDto,
        superadminUser,
      );

      expect(result).toEqual(updatedAgeRange);
      expect(service.update).toHaveBeenCalledWith(
        'age-range-id',
        mockUpdateDto,
      );
    });

    it('should update an age range for agency_admin', async () => {
      const updatedAgeRange = { ...mockAgeRange, ...mockUpdateDto };
      service.updateByAgency.mockResolvedValue(updatedAgeRange);

      const result = await controller.update(
        'agency-id',
        'age-range-id',
        mockUpdateDto,
        mockUser,
      );

      expect(result).toEqual(updatedAgeRange);
      expect(service.updateByAgency).toHaveBeenCalledWith(
        'age-range-id',
        'agency-id',
        mockUpdateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove an age range for superadmin', async () => {
      service.remove.mockResolvedValue(undefined);
      const superadminUser = { ...mockUser, role: 'superadmin' };

      await controller.remove('agency-id', 'age-range-id', superadminUser);

      expect(service.remove).toHaveBeenCalledWith('age-range-id');
    });

    it('should remove an age range for agency_admin', async () => {
      service.removeByAgency.mockResolvedValue(undefined);

      await controller.remove('agency-id', 'age-range-id', mockUser);

      expect(service.removeByAgency).toHaveBeenCalledWith(
        'age-range-id',
        'agency-id',
      );
    });
  });
});
