import { Test, TestingModule } from '@nestjs/testing';
import { TripItemsController } from './trip-items.controller';
import { TripItemsService } from './trip-items.service';

describe('TripItemsController', () => {
  let controller: TripItemsController;
  let service: jest.Mocked<TripItemsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripItemsController],
      providers: [
        {
          provide: TripItemsService,
          useValue: {
            create: jest.fn(),
            findAllByTrip: jest.fn(),
            findOneByTrip: jest.fn(),
            updateByTrip: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TripItemsController>(TripItemsController);
    service = module.get(TripItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a trip item', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const createDto = {
        name: 'Seguro viagem',
        isIncluded: true,
      };

      const createdItem = {
        id: 'item-1',
        tripId,
        ...createDto,
      };

      service.create.mockResolvedValue(createdItem as any);

      const result = await controller.create(agencyId, tripId, createDto);

      expect(service.create).toHaveBeenCalledWith(tripId, createDto);
      expect(result).toEqual(createdItem);
    });
  });

  describe('findAll', () => {
    it('should return all items for a trip', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const items = [
        { id: 'item-1', tripId, name: 'Item 1', isIncluded: true },
        { id: 'item-2', tripId, name: 'Item 2', isIncluded: false },
      ];

      service.findAllByTrip.mockResolvedValue(items as any);

      const result = await controller.findAll(agencyId, tripId);

      expect(service.findAllByTrip).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(items);
    });
  });

  describe('findOne', () => {
    it('should return a single trip item', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const itemId = 'item-1';
      const item = { id: itemId, tripId, name: 'Test', isIncluded: true };

      service.findOneByTrip.mockResolvedValue(item as any);

      const result = await controller.findOne(agencyId, tripId, itemId);

      expect(service.findOneByTrip).toHaveBeenCalledWith(itemId, tripId);
      expect(result).toEqual(item);
    });
  });

  describe('update', () => {
    it('should update a trip item', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const itemId = 'item-1';
      const updateDto = {
        name: 'Updated Item',
        isIncluded: false,
      };

      const updatedItem = {
        id: itemId,
        tripId,
        ...updateDto,
      };

      service.updateByTrip.mockResolvedValue(updatedItem as any);

      const result = await controller.update(
        agencyId,
        tripId,
        itemId,
        updateDto,
      );

      expect(service.updateByTrip).toHaveBeenCalledWith(
        itemId,
        tripId,
        updateDto,
      );
      expect(result).toEqual(updatedItem);
    });
  });

  describe('remove', () => {
    it('should remove a trip item', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const itemId = 'item-1';

      service.remove.mockResolvedValue(undefined);

      await controller.remove(agencyId, tripId, itemId);

      expect(service.remove).toHaveBeenCalledWith(itemId, tripId);
    });
  });
});
