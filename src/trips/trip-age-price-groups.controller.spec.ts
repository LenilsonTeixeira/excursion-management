import { Test, TestingModule } from '@nestjs/testing';
import { TripAgePriceGroupsController } from './trip-age-price-groups.controller';
import { TripAgePriceGroupsService } from './trip-age-price-groups.service';

describe('TripAgePriceGroupsController', () => {
  let controller: TripAgePriceGroupsController;
  let service: jest.Mocked<TripAgePriceGroupsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripAgePriceGroupsController],
      providers: [
        {
          provide: TripAgePriceGroupsService,
          useValue: {
            create: jest.fn(),
            findAllByTrip: jest.fn(),
            findOne: jest.fn(),
            findOneByTrip: jest.fn(),
            update: jest.fn(),
            updateByTrip: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TripAgePriceGroupsController>(
      TripAgePriceGroupsController,
    );
    service = module.get(TripAgePriceGroupsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a trip age price group', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const createDto = {
        ageRangeId: 'age-range-1',
        finalPrice: 199.99,
        originalPrice: 250.0,
        displayOrder: 1,
        description: 'Adulto',
        isActive: true,
      };

      const createdGroup = {
        id: 'price-group-1',
        tripId,
        ...createDto,
        finalPrice: '199.99',
        originalPrice: '250.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.create.mockResolvedValue(createdGroup as any);

      const result = await controller.create(agencyId, tripId, createDto);

      expect(service.create).toHaveBeenCalledWith(tripId, createDto);
      expect(result).toEqual(createdGroup);
    });
  });

  describe('findAllByTrip', () => {
    it('should return all price groups for a trip', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const groups = [
        {
          id: 'group-1',
          tripId,
          ageRangeId: 'age-1',
          finalPrice: '199.99',
          originalPrice: null,
          displayOrder: 1,
          description: 'Adulto',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'group-2',
          tripId,
          ageRangeId: 'age-2',
          finalPrice: '99.99',
          originalPrice: null,
          displayOrder: 2,
          description: 'Criança',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      service.findAllByTrip.mockResolvedValue(groups as any);

      const result = await controller.findAllByTrip(agencyId, tripId);

      expect(service.findAllByTrip).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(groups);
    });
  });

  describe('findOne', () => {
    it('should return a single price group', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const priceGroupId = 'group-1';
      const group = {
        id: priceGroupId,
        tripId: tripId,
        ageRangeId: 'age-1',
        finalPrice: '199.99',
        originalPrice: '250.00',
        displayOrder: 1,
        description: 'Adulto',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.findOneByTrip.mockResolvedValue(group as any);

      const result = await controller.findOne(agencyId, tripId, priceGroupId);

      expect(service.findOneByTrip).toHaveBeenCalledWith(priceGroupId, tripId);
      expect(result).toEqual(group);
    });
  });

  describe('update', () => {
    it('should update a price group', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const priceGroupId = 'group-1';
      const updateDto = {
        finalPrice: 179.99,
        originalPrice: 250.0,
        displayOrder: 2,
      };

      const updatedGroup = {
        id: priceGroupId,
        tripId: tripId,
        ageRangeId: 'age-1',
        finalPrice: '179.99',
        originalPrice: '250.00',
        displayOrder: 2,
        description: 'Adulto',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.updateByTrip.mockResolvedValue(updatedGroup as any);

      const result = await controller.update(
        agencyId,
        tripId,
        priceGroupId,
        updateDto,
      );

      expect(service.updateByTrip).toHaveBeenCalledWith(
        priceGroupId,
        tripId,
        updateDto,
      );
      expect(result).toEqual(updatedGroup);
    });
  });

  describe('remove', () => {
    it('should remove a price group', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const priceGroupId = 'group-1';

      service.remove.mockResolvedValue(undefined);

      await controller.remove(agencyId, tripId, priceGroupId);

      expect(service.remove).toHaveBeenCalledWith(priceGroupId, tripId);
    });
  });
});
