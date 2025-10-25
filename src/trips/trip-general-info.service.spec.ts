import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TripGeneralInfoService } from './trip-general-info.service';
import { TripGeneralInfoRepository } from './trip-general-info.repository';
import { TripsRepository } from './trips.repository';
import { CreateGeneralInfoItemDto } from './dto/create-general-info-item.dto';
import { UpdateGeneralInfoItemDto } from './dto/update-general-info-item.dto';

describe('TripGeneralInfoService', () => {
  let service: TripGeneralInfoService;
  let repository: jest.Mocked<TripGeneralInfoRepository>;
  let tripsRepository: jest.Mocked<TripsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripGeneralInfoService,
        {
          provide: TripGeneralInfoRepository,
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

    service = module.get<TripGeneralInfoService>(TripGeneralInfoService);
    repository = module.get(TripGeneralInfoRepository);
    tripsRepository = module.get(TripsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a general info item', async () => {
      const tripId = 'trip-1';
      const createDto: CreateGeneralInfoItemDto = {
        title: 'O que está incluído',
        description: 'Transporte e hospedagem',
        displayOrder: 1,
      };

      const trip = { id: tripId, destination: 'Test' };
      const createdItem = {
        id: 'info-1',
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
      const createDto: CreateGeneralInfoItemDto = {
        title: 'Test',
        description: 'Test',
        displayOrder: 1,
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
    it('should return all general info items for a trip', async () => {
      const tripId = 'trip-1';
      const items = [
        { id: 'info-1', tripId, title: 'Item 1', displayOrder: 1 },
        { id: 'info-2', tripId, title: 'Item 2', displayOrder: 2 },
      ];

      repository.findAllByTrip.mockResolvedValue(items as any);

      const result = await service.findAllByTrip(tripId);

      expect(repository.findAllByTrip).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(items);
    });
  });

  describe('findOneByTrip', () => {
    it('should return a general info item', async () => {
      const itemId = 'info-1';
      const tripId = 'trip-1';
      const item = { id: itemId, tripId, title: 'Test' };

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
        'Item de informação não encontrado nesta viagem',
      );
    });
  });

  describe('updateByTrip', () => {
    it('should update a general info item', async () => {
      const itemId = 'info-1';
      const tripId = 'trip-1';
      const updateDto: UpdateGeneralInfoItemDto = {
        title: 'Updated Title',
      };

      const updatedItem = {
        id: itemId,
        tripId,
        title: updateDto.title,
        description: 'Original description',
        displayOrder: 1,
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
      const updateDto: UpdateGeneralInfoItemDto = {
        title: 'Updated',
      };

      repository.updateByTrip.mockResolvedValue(null);

      await expect(
        service.updateByTrip(itemId, tripId, updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateByTrip(itemId, tripId, updateDto),
      ).rejects.toThrow('Item de informação não encontrado nesta viagem');
    });
  });

  describe('remove', () => {
    it('should remove a general info item', async () => {
      const itemId = 'info-1';
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
        'Item de informação não encontrado nesta viagem',
      );
    });
  });
});
