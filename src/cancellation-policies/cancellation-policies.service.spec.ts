import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CancellationPoliciesService } from './cancellation-policies.service';
import {
  CancellationPoliciesRepository,
  CancellationPolicy,
} from './cancellation-policies.repository';
import { CreateCancellationPolicyDto } from './dto/create-cancellation-policy.dto';
import { UpdateCancellationPolicyDto } from './dto/update-cancellation-policy.dto';

describe('CancellationPoliciesService', () => {
  let service: CancellationPoliciesService;
  let repository: jest.Mocked<CancellationPoliciesRepository>;

  const mockPolicy: CancellationPolicy = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Política Flexível',
    description: 'Reembolso de até 80% se cancelado com antecedência.',
    isDefault: false,
    agencyId: '123e4567-e89b-12d3-a456-426614174001',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    rules: [
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        policyId: '123e4567-e89b-12d3-a456-426614174000',
        daysBeforeTrip: 15,
        refundPercentage: '0.8',
        displayOrder: 1,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ],
  };

  const mockCreateDto: CreateCancellationPolicyDto = {
    name: 'Política Flexível',
    description: 'Reembolso de até 80% se cancelado com antecedência.',
    isDefault: false,
    rules: [
      {
        daysBeforeTrip: 15,
        refundPercentage: 0.8,
        displayOrder: 1,
      },
    ],
  };

  const mockUpdateDto: UpdateCancellationPolicyDto = {
    name: 'Política Flexível Atualizada',
  };

  const mockUpdatedPolicy: CancellationPolicy = {
    ...mockPolicy,
    name: 'Política Flexível Atualizada',
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAllByAgency: jest.fn(),
      findOne: jest.fn(),
      findOneByAgency: jest.fn(),
      findByNameAndAgency: jest.fn(),
      findDefaultByAgency: jest.fn(),
      update: jest.fn(),
      updateByAgency: jest.fn(),
      remove: jest.fn(),
      removeByAgency: jest.fn(),
      countByAgency: jest.fn(),
      setDefaultPolicy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancellationPoliciesService,
        {
          provide: CancellationPoliciesRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CancellationPoliciesService>(
      CancellationPoliciesService,
    );
    repository = module.get(CancellationPoliciesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a cancellation policy successfully', async () => {
      repository.findByNameAndAgency.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockPolicy);

      const result = await service.create('agency-id', mockCreateDto);

      expect(repository.findByNameAndAgency).toHaveBeenCalledWith(
        mockCreateDto.name,
        'agency-id',
      );
      expect(repository.create).toHaveBeenCalledWith(
        'agency-id',
        mockCreateDto,
      );
      expect(result).toEqual(mockPolicy);
    });

    it('should throw ConflictException when name already exists', async () => {
      repository.findByNameAndAgency.mockResolvedValue(mockPolicy);

      await expect(service.create('agency-id', mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByNameAndAgency).toHaveBeenCalledWith(
        mockCreateDto.name,
        'agency-id',
      );
    });

    it('should throw BadRequestException when rules are invalid', async () => {
      const invalidDto = {
        ...mockCreateDto,
        rules: [], // Empty rules
      };

      await expect(service.create('agency-id', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when duplicate daysBeforeTrip', async () => {
      const invalidDto = {
        ...mockCreateDto,
        rules: [
          { daysBeforeTrip: 15, refundPercentage: 0.8, displayOrder: 1 },
          { daysBeforeTrip: 15, refundPercentage: 0.5, displayOrder: 2 },
        ],
      };

      await expect(service.create('agency-id', invalidDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should set default policy when isDefault is true', async () => {
      const defaultDto = { ...mockCreateDto, isDefault: true };
      repository.findByNameAndAgency.mockResolvedValue(null);
      repository.create.mockResolvedValue({ ...mockPolicy, isDefault: false }); // Criado como não padrão
      repository.setDefaultPolicy.mockResolvedValue(undefined);

      await service.create('agency-id', defaultDto);

      expect(repository.setDefaultPolicy).toHaveBeenCalledWith(
        'agency-id',
        mockPolicy.id,
      );
    });
  });

  describe('findAllByAgency', () => {
    it('should return all policies for an agency', async () => {
      const policies = [mockPolicy];
      repository.findAllByAgency.mockResolvedValue(policies);

      const result = await service.findAllByAgency('agency-id');

      expect(repository.findAllByAgency).toHaveBeenCalledWith('agency-id');
      expect(result).toEqual(policies);
    });
  });

  describe('findOne', () => {
    it('should return a policy by id', async () => {
      repository.findOne.mockResolvedValue(mockPolicy);

      const result = await service.findOne('policy-id');

      expect(repository.findOne).toHaveBeenCalledWith('policy-id');
      expect(result).toEqual(mockPolicy);
    });

    it('should throw NotFoundException when policy not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('policy-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByAgency', () => {
    it('should return a policy by id and agency', async () => {
      repository.findOneByAgency.mockResolvedValue(mockPolicy);

      const result = await service.findOneByAgency('policy-id', 'agency-id');

      expect(repository.findOneByAgency).toHaveBeenCalledWith(
        'policy-id',
        'agency-id',
      );
      expect(result).toEqual(mockPolicy);
    });

    it('should throw NotFoundException when policy not found in agency', async () => {
      repository.findOneByAgency.mockResolvedValue(null);

      await expect(
        service.findOneByAgency('policy-id', 'agency-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a policy successfully', async () => {
      repository.findOne.mockResolvedValue(mockPolicy);
      repository.update.mockResolvedValue(mockUpdatedPolicy);

      const result = await service.update('policy-id', mockUpdateDto);

      expect(repository.findOne).toHaveBeenCalledWith('policy-id');
      expect(repository.update).toHaveBeenCalledWith(
        'policy-id',
        mockUpdateDto,
      );
      expect(result).toEqual(mockUpdatedPolicy);
    });

    it('should throw NotFoundException when policy not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('policy-id', mockUpdateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when name already exists', async () => {
      repository.findOne.mockResolvedValue(mockPolicy);
      repository.findByNameAndAgency.mockResolvedValue(mockPolicy);

      const updateWithExistingName = { name: 'Existing Name' };

      await expect(
        service.update('policy-id', updateWithExistingName),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateByAgency', () => {
    it('should update a policy by agency successfully', async () => {
      repository.findOneByAgency.mockResolvedValue(mockPolicy);
      repository.updateByAgency.mockResolvedValue(mockUpdatedPolicy);

      const result = await service.updateByAgency(
        'policy-id',
        'agency-id',
        mockUpdateDto,
      );

      expect(repository.findOneByAgency).toHaveBeenCalledWith(
        'policy-id',
        'agency-id',
      );
      expect(repository.updateByAgency).toHaveBeenCalledWith(
        'policy-id',
        'agency-id',
        mockUpdateDto,
      );
      expect(result).toEqual(mockUpdatedPolicy);
    });

    it('should throw NotFoundException when policy not found in agency', async () => {
      repository.findOneByAgency.mockResolvedValue(null);

      await expect(
        service.updateByAgency('policy-id', 'agency-id', mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a policy successfully', async () => {
      repository.remove.mockResolvedValue(true);

      await service.remove('policy-id');

      expect(repository.remove).toHaveBeenCalledWith('policy-id');
    });

    it('should throw NotFoundException when policy not found', async () => {
      repository.remove.mockResolvedValue(false);

      await expect(service.remove('policy-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeByAgency', () => {
    it('should remove a policy by agency successfully', async () => {
      repository.removeByAgency.mockResolvedValue(true);

      await service.removeByAgency('policy-id', 'agency-id');

      expect(repository.removeByAgency).toHaveBeenCalledWith(
        'policy-id',
        'agency-id',
      );
    });

    it('should throw NotFoundException when policy not found in agency', async () => {
      repository.removeByAgency.mockResolvedValue(false);

      await expect(
        service.removeByAgency('policy-id', 'agency-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('countByAgency', () => {
    it('should return count of policies for an agency', async () => {
      repository.countByAgency.mockResolvedValue(5);

      const result = await service.countByAgency('agency-id');

      expect(repository.countByAgency).toHaveBeenCalledWith('agency-id');
      expect(result).toBe(5);
    });
  });

  describe('validateRules', () => {
    it('should throw BadRequestException for empty rules', async () => {
      const invalidDto = { ...mockCreateDto, rules: [] };

      await expect(service.create('agency-id', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException for duplicate displayOrder', async () => {
      const invalidDto = {
        ...mockCreateDto,
        rules: [
          { daysBeforeTrip: 15, refundPercentage: 0.8, displayOrder: 1 },
          { daysBeforeTrip: 7, refundPercentage: 0.5, displayOrder: 1 },
        ],
      };

      await expect(service.create('agency-id', invalidDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for invalid refund percentage', async () => {
      const invalidDto = {
        ...mockCreateDto,
        rules: [{ daysBeforeTrip: 15, refundPercentage: 1.5, displayOrder: 1 }],
      };

      await expect(service.create('agency-id', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid days before trip', async () => {
      const invalidDto = {
        ...mockCreateDto,
        rules: [{ daysBeforeTrip: -1, refundPercentage: 0.8, displayOrder: 1 }],
      };

      await expect(service.create('agency-id', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid refund percentage order', async () => {
      const invalidDto = {
        ...mockCreateDto,
        rules: [
          { daysBeforeTrip: 15, refundPercentage: 0.5, displayOrder: 1 },
          { daysBeforeTrip: 7, refundPercentage: 0.8, displayOrder: 2 },
        ],
      };

      await expect(service.create('agency-id', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
