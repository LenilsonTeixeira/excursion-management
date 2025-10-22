import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CancellationPoliciesController } from './cancellation-policies.controller';
import { CancellationPoliciesService } from './cancellation-policies.service';
import { CreateCancellationPolicyDto } from './dto/create-cancellation-policy.dto';
import { UpdateCancellationPolicyDto } from './dto/update-cancellation-policy.dto';
import { CancellationPolicy } from './cancellation-policies.repository';

describe('CancellationPoliciesController', () => {
  let controller: CancellationPoliciesController;
  let service: jest.Mocked<CancellationPoliciesService>;

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

  const mockUser = {
    sub: 'user-id',
    email: 'test@example.com',
    role: 'agency_admin',
    tenantId: 'tenant-id',
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAllByAgency: jest.fn(),
      findOne: jest.fn(),
      findOneByAgency: jest.fn(),
      findDefaultByAgency: jest.fn(),
      update: jest.fn(),
      updateByAgency: jest.fn(),
      remove: jest.fn(),
      removeByAgency: jest.fn(),
      countByAgency: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CancellationPoliciesController],
      providers: [
        {
          provide: CancellationPoliciesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CancellationPoliciesController>(
      CancellationPoliciesController,
    );
    service = module.get(CancellationPoliciesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a cancellation policy', async () => {
      service.create.mockResolvedValue(mockPolicy);

      const result = await controller.create('agency-id', mockCreateDto);

      expect(service.create).toHaveBeenCalledWith('agency-id', mockCreateDto);
      expect(result).toEqual(mockPolicy);
    });
  });

  describe('findAllByAgency', () => {
    it('should return all policies for an agency', async () => {
      const policies = [mockPolicy];
      service.findAllByAgency.mockResolvedValue(policies);

      const result = await controller.findAllByAgency('agency-id');

      expect(service.findAllByAgency).toHaveBeenCalledWith('agency-id');
      expect(result).toEqual(policies);
    });
  });

  describe('findDefaultByAgency', () => {
    it('should return default policy for an agency', async () => {
      service.findDefaultByAgency.mockResolvedValue(mockPolicy);

      const result = await controller.findDefaultByAgency('agency-id');

      expect(service.findDefaultByAgency).toHaveBeenCalledWith('agency-id');
      expect(result).toEqual(mockPolicy);
    });

    it('should throw NotFoundException when default policy not found', async () => {
      service.findDefaultByAgency.mockResolvedValue(null);

      await expect(controller.findDefaultByAgency('agency-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a policy for superadmin', async () => {
      const superadminUser = { ...mockUser, role: 'superadmin' };
      service.findOne.mockResolvedValue(mockPolicy);

      const result = await controller.findOne(
        'agency-id',
        'policy-id',
        superadminUser,
      );

      expect(service.findOne).toHaveBeenCalledWith('policy-id');
      expect(result).toEqual(mockPolicy);
    });

    it('should return a policy for agency_admin', async () => {
      service.findOneByAgency.mockResolvedValue(mockPolicy);

      const result = await controller.findOne(
        'agency-id',
        'policy-id',
        mockUser,
      );

      expect(service.findOneByAgency).toHaveBeenCalledWith(
        'policy-id',
        'agency-id',
      );
      expect(result).toEqual(mockPolicy);
    });
  });

  describe('update', () => {
    it('should update a policy for superadmin', async () => {
      const superadminUser = { ...mockUser, role: 'superadmin' };
      service.update.mockResolvedValue(mockUpdatedPolicy);

      const result = await controller.update(
        'agency-id',
        'policy-id',
        mockUpdateDto,
        superadminUser,
      );

      expect(service.update).toHaveBeenCalledWith('policy-id', mockUpdateDto);
      expect(result).toEqual(mockUpdatedPolicy);
    });

    it('should update a policy for agency_admin', async () => {
      service.updateByAgency.mockResolvedValue(mockUpdatedPolicy);

      const result = await controller.update(
        'agency-id',
        'policy-id',
        mockUpdateDto,
        mockUser,
      );

      expect(service.updateByAgency).toHaveBeenCalledWith(
        'policy-id',
        'agency-id',
        mockUpdateDto,
      );
      expect(result).toEqual(mockUpdatedPolicy);
    });
  });

  describe('remove', () => {
    it('should remove a policy for superadmin', async () => {
      const superadminUser = { ...mockUser, role: 'superadmin' };
      service.remove.mockResolvedValue(undefined);

      await controller.remove('agency-id', 'policy-id', superadminUser);

      expect(service.remove).toHaveBeenCalledWith('policy-id');
    });

    it('should remove a policy for agency_admin', async () => {
      service.removeByAgency.mockResolvedValue(undefined);

      await controller.remove('agency-id', 'policy-id', mockUser);

      expect(service.removeByAgency).toHaveBeenCalledWith(
        'policy-id',
        'agency-id',
      );
    });
  });
});
