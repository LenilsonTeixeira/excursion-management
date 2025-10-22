import { Test, TestingModule } from '@nestjs/testing';
import { TripCategoriesController } from './trip-categories.controller';
import { TripCategoriesService } from './trip-categories.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtPayload } from '../common/decorators/current-user.decorator';

describe('TripCategoriesController', () => {
  let controller: TripCategoriesController;
  let service: TripCategoriesService;

  const mockTripCategory = {
    id: 'trip-category-id-1',
    name: 'Bate e Volta',
    agencyId: 'agency-id-1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCreateTripCategoryDto = {
    name: 'Bate e Volta',
  };

  const mockUpdateTripCategoryDto = {
    name: 'Viagem com Hospedagem',
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
      controllers: [TripCategoriesController],
      providers: [
        {
          provide: TripCategoriesService,
          useValue: {
            create: jest.fn(),
            findAllByAgency: jest.fn(),
            findOne: jest.fn(),
            findOneByAgency: jest.fn(),
            update: jest.fn(),
            updateByAgency: jest.fn(),
            remove: jest.fn(),
            removeByAgency: jest.fn(),
            countByAgency: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TripCategoriesController>(TripCategoriesController);
    service = module.get<TripCategoriesService>(TripCategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a trip category', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockTripCategory);

      const result = await controller.create(
        'agency-id-1',
        mockCreateTripCategoryDto,
      );

      expect(service.create).toHaveBeenCalledWith(
        'agency-id-1',
        mockCreateTripCategoryDto,
      );
      expect(result).toEqual(mockTripCategory);
    });
  });

  describe('findAllByAgency', () => {
    it('should return all trip categories for an agency', async () => {
      const tripCategories = [mockTripCategory];
      jest.spyOn(service, 'findAllByAgency').mockResolvedValue(tripCategories);

      const result = await controller.findAllByAgency('agency-id-1');

      expect(service.findAllByAgency).toHaveBeenCalledWith('agency-id-1');
      expect(result).toEqual(tripCategories);
    });
  });

  describe('findOne', () => {
    it('should return a trip category for superadmin', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTripCategory);

      const result = await controller.findOne(
        'agency-id-1',
        'trip-category-id-1',
        mockSuperAdminUser,
      );

      expect(service.findOne).toHaveBeenCalledWith('trip-category-id-1');
      expect(result).toEqual(mockTripCategory);
    });

    it('should return a trip category for agency_admin from same agency', async () => {
      jest
        .spyOn(service, 'findOneByAgency')
        .mockResolvedValue(mockTripCategory);

      const result = await controller.findOne(
        'agency-id-1',
        'trip-category-id-1',
        mockAgencyAdminUser,
      );

      expect(service.findOneByAgency).toHaveBeenCalledWith(
        'trip-category-id-1',
        'agency-id-1',
      );
      expect(result).toEqual(mockTripCategory);
    });
  });

  describe('update', () => {
    it('should update a trip category for superadmin', async () => {
      const updatedTripCategory = {
        ...mockTripCategory,
        ...mockUpdateTripCategoryDto,
      };
      jest.spyOn(service, 'update').mockResolvedValue(updatedTripCategory);

      const result = await controller.update(
        'agency-id-1',
        'trip-category-id-1',
        mockUpdateTripCategoryDto,
        mockSuperAdminUser,
      );

      expect(service.update).toHaveBeenCalledWith(
        'trip-category-id-1',
        mockUpdateTripCategoryDto,
      );
      expect(result).toEqual(updatedTripCategory);
    });

    it('should update a trip category for agency_admin from same agency', async () => {
      const updatedTripCategory = {
        ...mockTripCategory,
        ...mockUpdateTripCategoryDto,
      };
      jest
        .spyOn(service, 'updateByAgency')
        .mockResolvedValue(updatedTripCategory);

      const result = await controller.update(
        'agency-id-1',
        'trip-category-id-1',
        mockUpdateTripCategoryDto,
        mockAgencyAdminUser,
      );

      expect(service.updateByAgency).toHaveBeenCalledWith(
        'trip-category-id-1',
        'agency-id-1',
        mockUpdateTripCategoryDto,
      );
      expect(result).toEqual(updatedTripCategory);
    });
  });

  describe('remove', () => {
    it('should remove a trip category for superadmin', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(
        'agency-id-1',
        'trip-category-id-1',
        mockSuperAdminUser,
      );

      expect(service.remove).toHaveBeenCalledWith('trip-category-id-1');
    });

    it('should remove a trip category for agency_admin from same agency', async () => {
      jest.spyOn(service, 'removeByAgency').mockResolvedValue(undefined);

      await controller.remove(
        'agency-id-1',
        'trip-category-id-1',
        mockAgencyAdminUser,
      );

      expect(service.removeByAgency).toHaveBeenCalledWith(
        'trip-category-id-1',
        'agency-id-1',
      );
    });
  });
});
