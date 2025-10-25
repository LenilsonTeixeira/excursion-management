import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TripItemsService } from './trip-items.service';
import { TripItemsRepository } from './trip-items.repository';
import { TripsRepository } from './trips.repository';
import { CreateTripItemDto } from './dto/create-trip-item.dto';
import { UpdateTripItemDto } from './dto/update-trip-item.dto';

describe('TripItemsService', () => {
  let service: TripItemsService;
  let repository: jest.Mocked<TripItemsRepository>;
  let tripsRepository: jest.Mocked<TripsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripItemsService,
        {
          provide: TripItemsRepository,
          useValue: {
            create: jest.fn(),
            findAllByTrip: jest.fn(),
            findOne: jest.fn(),
            findOneByTrip: jest.fn(),
            update: jest.fn(),
            updateByTrip: jest.fn(),
            removeByTrip: jest.fn(),
          },
        },
        {
          provide: TripsRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TripItemsService>(TripItemsService);
    repository = module.get(TripItemsRepository);
    tripsRepository = module.get(TripsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a trip item', async () => {
      const tripId = 'trip-1';
      const createDto: CreateTripItemDto = {
        name: 'Seguro viagem',
        isIncluded: true,
      };

      const trip = { id: tripId, destination: 'Test' };
      const createdItem = {
        id: 'item-1',
        tripId,
        ...createDto,
      };

      tripsRepository.findOne.mockResolvedValue(trip as any);
      repository.create.mockResolvedValue(createdItem as any);

      const result = await service.create(tripId, createDto);

      expect(tripsRepository.findOne).toHaveBeenCalledWith(tripId);
      expect(repository.create).toHaveBeenCalledWith(tripId, createDto);
      expect(result).toEqual(createdItem);
    });

    it('should throw NotFoundException if trip not found', async () => {
      const tripId = 'non-existent';
      const createDto: CreateTripItemDto = {
        name: 'Test',
        isIncluded: true,
      };

      tripsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(tripId, createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(tripId, createDto)).rejects.toThrow(
        'Viagem não encontrada',
      );
    });
  });

  describe('findAllByTrip', () => {
    it('should return all items for a trip', async () => {
      const tripId = 'trip-1';
      const items = [
        { id: 'item-1', tripId, name: 'Item 1', isIncluded: true },
        { id: 'item-2', tripId, name: 'Item 2', isIncluded: false },
      ];

      repository.findAllByTrip.mockResolvedValue(items as any);

      const result = await service.findAllByTrip(tripId);

      expect(repository.findAllByTrip).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(items);
    });
  });

  describe('findOneByTrip', () => {
    it('should return a trip item', async () => {
      const itemId = 'item-1';
      const tripId = 'trip-1';
      const item = { id: itemId, tripId, name: 'Test', isIncluded: true };

      repository.findOneByTrip.mockResolvedValue(item as any);

      const result = await service.findOneByTrip(itemId, tripId);

      expect(repository.findOneByTrip).toHaveBeenCalledWith(itemId, tripId);
      expect(result).toEqual(item);
    });

    it('should throw NotFoundException if item not found', async () => {
      const itemId = 'non-existent';
      const tripId = 'trip-1';

      repository.findOneByTrip.mockResolvedValue(null);

      await expect(service.findOneByTrip(itemId, tripId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOneByTrip(itemId, tripId)).rejects.toThrow(
        'Item não encontrado nesta viagem',
      );
    });
  });

  describe('updateByTrip', () => {
    it('should update a trip item', async () => {
      const itemId = 'item-1';
      const tripId = 'trip-1';
      const updateDto: UpdateTripItemDto = {
        name: 'Updated Item',
        isIncluded: false,
      };

      const updatedItem = {
        id: itemId,
        tripId,
        ...updateDto,
      };

      repository.updateByTrip.mockResolvedValue(updatedItem as any);

      const result = await service.updateByTrip(itemId, tripId, updateDto);

      expect(repository.updateByTrip).toHaveBeenCalledWith(
        itemId,
        tripId,
        updateDto,
      );
      expect(result).toEqual(updatedItem);
    });

    it('should throw NotFoundException if item not found', async () => {
      const itemId = 'non-existent';
      const tripId = 'trip-1';
      const updateDto: UpdateTripItemDto = {
        name: 'Updated',
      };

      repository.updateByTrip.mockResolvedValue(null);

      await expect(
        service.updateByTrip(itemId, tripId, updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateByTrip(itemId, tripId, updateDto),
      ).rejects.toThrow('Item não encontrado nesta viagem');
    });
  });

  describe('remove', () => {
    it('should remove a trip item', async () => {
      const itemId = 'item-1';
      const tripId = 'trip-1';

      repository.removeByTrip.mockResolvedValue(true);

      await service.remove(itemId, tripId);

      expect(repository.removeByTrip).toHaveBeenCalledWith(itemId, tripId);
    });

    it('should throw NotFoundException if item not found', async () => {
      const itemId = 'non-existent';
      const tripId = 'trip-1';

      repository.removeByTrip.mockResolvedValue(false);

      await expect(service.remove(itemId, tripId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove(itemId, tripId)).rejects.toThrow(
        'Item não encontrado nesta viagem',
      );
    });
  });
});
