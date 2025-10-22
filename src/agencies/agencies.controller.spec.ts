import { Test, TestingModule } from '@nestjs/testing';
import { AgenciesController } from './agencies.controller';
import { AgenciesService } from './agencies.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtPayload } from '../common/decorators/current-user.decorator';

describe('AgenciesController', () => {
  let controller: AgenciesController;
  let service: AgenciesService;

  const mockAgency = {
    id: 'agency-id-1',
    tenantId: 'tenant-id-1',
    name: 'Agência ABC',
    cadastur: '12.34567.89/0001-12',
    cnpj: '12.345.678/0001-90',
    description: 'Agência de viagens',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCreateAgencyDto = {
    name: 'Agência ABC',
    cadastur: '12.34567.89/0001-12',
    cnpj: '12.345.678/0001-90',
    description: 'Agência de viagens',
  };

  const mockUpdateAgencyDto = {
    name: 'Agência ABC Atualizada',
    description: 'Nova descrição',
  };

  const mockSuperAdminUser: JwtPayload = {
    sub: 'user-id-1',
    email: 'superadmin@example.com',
    role: 'superadmin',
    tenantId: 'tenant-id-1',
  };

  const mockAgencyAdminUser: JwtPayload = {
    sub: 'user-id-2',
    email: 'admin@example.com',
    role: 'agency_admin',
    tenantId: 'tenant-id-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgenciesController],
      providers: [
        {
          provide: AgenciesService,
          useValue: {
            create: jest.fn(),
            findAllByTenant: jest.fn(),
            findOne: jest.fn(),
            findOneByTenant: jest.fn(),
            update: jest.fn(),
            updateByTenant: jest.fn(),
            remove: jest.fn(),
            countByTenant: jest.fn(),
            validateTenantAccess: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AgenciesController>(AgenciesController);
    service = module.get<AgenciesService>(AgenciesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an agency', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockAgency);

      const result = await controller.create(
        'tenant-id-1',
        mockCreateAgencyDto,
      );

      expect(service.create).toHaveBeenCalledWith(
        'tenant-id-1',
        mockCreateAgencyDto,
      );
      expect(result).toEqual(mockAgency);
    });
  });

  describe('findAllByTenant', () => {
    it('should return all agencies for a tenant', async () => {
      const agencies = [mockAgency];
      jest.spyOn(service, 'findAllByTenant').mockResolvedValue(agencies);

      const result = await controller.findAllByTenant('tenant-id-1');

      expect(service.findAllByTenant).toHaveBeenCalledWith('tenant-id-1');
      expect(result).toEqual(agencies);
    });
  });

  describe('findOne', () => {
    it('should return an agency for superadmin', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAgency);

      const result = await controller.findOne(
        'agency-id-1',
        mockSuperAdminUser,
        'tenant-id-1',
      );

      expect(service.findOne).toHaveBeenCalledWith('agency-id-1');
      expect(result).toEqual(mockAgency);
    });

    it('should return an agency for agency_admin from same tenant', async () => {
      jest.spyOn(service, 'findOneByTenant').mockResolvedValue(mockAgency);

      const result = await controller.findOne(
        'agency-id-1',
        mockAgencyAdminUser,
        'tenant-id-1',
      );

      expect(service.findOneByTenant).toHaveBeenCalledWith(
        'agency-id-1',
        'tenant-id-1',
      );
      expect(result).toEqual(mockAgency);
    });
  });

  describe('update', () => {
    it('should update an agency for superadmin', async () => {
      const updatedAgency = { ...mockAgency, ...mockUpdateAgencyDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedAgency);

      const result = await controller.update(
        'agency-id-1',
        mockUpdateAgencyDto,
        mockSuperAdminUser,
        'tenant-id-1',
      );

      expect(service.update).toHaveBeenCalledWith(
        'agency-id-1',
        mockUpdateAgencyDto,
      );
      expect(result).toEqual(updatedAgency);
    });

    it('should update an agency for agency_admin from same tenant', async () => {
      const updatedAgency = { ...mockAgency, ...mockUpdateAgencyDto };
      jest.spyOn(service, 'updateByTenant').mockResolvedValue(updatedAgency);

      const result = await controller.update(
        'agency-id-1',
        mockUpdateAgencyDto,
        mockAgencyAdminUser,
        'tenant-id-1',
      );

      expect(service.updateByTenant).toHaveBeenCalledWith(
        'agency-id-1',
        'tenant-id-1',
        mockUpdateAgencyDto,
      );
      expect(result).toEqual(updatedAgency);
    });
  });

  describe('remove', () => {
    it('should remove an agency', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove('agency-id-1');

      expect(service.remove).toHaveBeenCalledWith('agency-id-1');
    });
  });
});
