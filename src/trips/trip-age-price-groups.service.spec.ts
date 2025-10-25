import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TripAgePriceGroupsService } from './trip-age-price-groups.service';
import { TripAgePriceGroupsRepository } from './trip-age-price-groups.repository';
import { TripsRepository } from './trips.repository';
import { CreateTripAgePriceGroupDto } from './dto/create-trip-age-price-group.dto';
import { UpdateTripAgePriceGroupDto } from './dto/update-trip-age-price-group.dto';

describe('TripAgePriceGroupsService', () => {
  let service: TripAgePriceGroupsService;
  let repository: jest.Mocked<TripAgePriceGroupsRepository>;
  let tripsRepository: jest.Mocked<TripsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripAgePriceGroupsService,
        {
          provide: TripAgePriceGroupsRepository,
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

    service = module.get<TripAgePriceGroupsService>(TripAgePriceGroupsService);
    repository = module.get(TripAgePriceGroupsRepository);
    tripsRepository = module.get(TripsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a trip age price group', async () => {
      const tripId = 'trip-1';
      const createDto: CreateTripAgePriceGroupDto = {
        ageRangeId: 'age-range-1',
        finalPrice: 199.99,
        originalPrice: 250.0,
        displayOrder: 1,
        description: 'Adulto',
        isActive: true,
      };

      const trip = { id: tripId, destination: 'Test' };
      const createdGroup = {
        id: 'group-1',
        tripId,
        ...createDto,
        finalPrice: '199.99',
        originalPrice: '250.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tripsRepository.findOne.mockResolvedValue(trip as any);
      repository.create.mockResolvedValue(createdGroup as any);

      const result = await service.create(tripId, createDto);

      expect(tripsRepository.findOne).toHaveBeenCalledWith(tripId);
      expect(repository.create).toHaveBeenCalledWith(tripId, createDto);
      expect(result).toEqual(createdGroup);
    });

    it('should throw NotFoundException if trip not found', async () => {
      const tripId = 'non-existent';
      const createDto: CreateTripAgePriceGroupDto = {
        ageRangeId: 'age-range-1',
        finalPrice: 199.99,
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

    it('should throw BadRequestException if originalPrice <= finalPrice', async () => {
      const tripId = 'trip-1';
      const createDto: CreateTripAgePriceGroupDto = {
        ageRangeId: 'age-range-1',
        finalPrice: 199.99,
        originalPrice: 150.0,
        displayOrder: 1,
      };

      const trip = { id: tripId, destination: 'Test' };
      tripsRepository.findOne.mockResolvedValue(trip as any);

      await expect(service.create(tripId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(tripId, createDto)).rejects.toThrow(
        'O preço original deve ser maior que o preço final',
      );
    });
  });

  describe('findAllByTrip', () => {
    it('should return all price groups for a trip', async () => {
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

      repository.findAllByTrip.mockResolvedValue(groups as any);

      const result = await service.findAllByTrip(tripId);

      expect(repository.findAllByTrip).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(groups);
    });
  });

  describe('findOne', () => {
    it('should return a price group', async () => {
      const groupId = 'group-1';
      const group = {
        id: groupId,
        tripId: 'trip-1',
        ageRangeId: 'age-1',
        finalPrice: '199.99',
        originalPrice: '250.00',
        displayOrder: 1,
        description: 'Adulto',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findOne.mockResolvedValue(group as any);

      const result = await service.findOne(groupId);

      expect(repository.findOne).toHaveBeenCalledWith(groupId);
      expect(result).toEqual(group);
    });

    it('should throw NotFoundException if group not found', async () => {
      const groupId = 'non-existent';

      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(groupId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(groupId)).rejects.toThrow(
        'Grupo de preço não encontrado',
      );
    });
  });

  describe('findOneByTrip', () => {
    it('should return a price group for a trip', async () => {
      const groupId = 'group-1';
      const tripId = 'trip-1';
      const group = {
        id: groupId,
        tripId,
        ageRangeId: 'age-1',
        finalPrice: '199.99',
        originalPrice: null,
        displayOrder: 1,
        description: 'Adulto',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findOneByTrip.mockResolvedValue(group as any);

      const result = await service.findOneByTrip(groupId, tripId);

      expect(repository.findOneByTrip).toHaveBeenCalledWith(groupId, tripId);
      expect(result).toEqual(group);
    });

    it('should throw NotFoundException if group not found in trip', async () => {
      const groupId = 'non-existent';
      const tripId = 'trip-1';

      repository.findOneByTrip.mockResolvedValue(null);

      await expect(service.findOneByTrip(groupId, tripId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOneByTrip(groupId, tripId)).rejects.toThrow(
        'Grupo de preço não encontrado nesta viagem',
      );
    });
  });

  describe('update', () => {
    it('should update a price group', async () => {
      const groupId = 'group-1';
      const updateDto: UpdateTripAgePriceGroupDto = {
        finalPrice: 179.99,
        displayOrder: 2,
      };

      const currentGroup = {
        id: groupId,
        tripId: 'trip-1',
        ageRangeId: 'age-1',
        finalPrice: '199.99',
        originalPrice: '250.00',
        displayOrder: 1,
        description: 'Adulto',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedGroup = {
        ...currentGroup,
        ...updateDto,
        finalPrice: '179.99',
        displayOrder: 2,
      };

      repository.findOne.mockResolvedValue(currentGroup as any);
      repository.update.mockResolvedValue(updatedGroup as any);

      const result = await service.update(groupId, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith(groupId);
      expect(repository.update).toHaveBeenCalledWith(groupId, updateDto);
      expect(result).toEqual(updatedGroup);
    });

    it('should throw NotFoundException if group not found', async () => {
      const groupId = 'non-existent';
      const updateDto: UpdateTripAgePriceGroupDto = {
        finalPrice: 179.99,
      };

      repository.findOne.mockResolvedValue(null);

      await expect(service.update(groupId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(groupId, updateDto)).rejects.toThrow(
        'Grupo de preço não encontrado',
      );
    });

    it('should throw BadRequestException if originalPrice <= finalPrice', async () => {
      const groupId = 'group-1';
      const updateDto: UpdateTripAgePriceGroupDto = {
        originalPrice: 150.0,
      };

      const currentGroup = {
        id: groupId,
        tripId: 'trip-1',
        ageRangeId: 'age-1',
        finalPrice: '199.99',
        originalPrice: '250.00',
        displayOrder: 1,
        description: 'Adulto',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findOne.mockResolvedValue(currentGroup as any);

      await expect(service.update(groupId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(groupId, updateDto)).rejects.toThrow(
        'O preço original deve ser maior que o preço final',
      );
    });
  });

  describe('updateByTrip', () => {
    it('should update a price group by trip', async () => {
      const groupId = 'group-1';
      const tripId = 'trip-1';
      const updateDto: UpdateTripAgePriceGroupDto = {
        finalPrice: 179.99,
      };

      const currentGroup = {
        id: groupId,
        tripId,
        ageRangeId: 'age-1',
        finalPrice: '199.99',
        originalPrice: null,
        displayOrder: 1,
        description: 'Adulto',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedGroup = {
        ...currentGroup,
        finalPrice: '179.99',
      };

      repository.findOneByTrip.mockResolvedValue(currentGroup as any);
      repository.updateByTrip.mockResolvedValue(updatedGroup as any);

      const result = await service.updateByTrip(groupId, tripId, updateDto);

      expect(repository.findOneByTrip).toHaveBeenCalledWith(groupId, tripId);
      expect(repository.updateByTrip).toHaveBeenCalledWith(
        groupId,
        tripId,
        updateDto,
      );
      expect(result).toEqual(updatedGroup);
    });

    it('should throw NotFoundException if group not found in trip', async () => {
      const groupId = 'non-existent';
      const tripId = 'trip-1';
      const updateDto: UpdateTripAgePriceGroupDto = {
        finalPrice: 179.99,
      };

      repository.findOneByTrip.mockResolvedValue(null);

      await expect(
        service.updateByTrip(groupId, tripId, updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateByTrip(groupId, tripId, updateDto),
      ).rejects.toThrow('Grupo de preço não encontrado nesta viagem');
    });
  });

  describe('remove', () => {
    it('should remove a price group', async () => {
      const groupId = 'group-1';
      const tripId = 'trip-1';

      repository.removeByTrip.mockResolvedValue(true);

      await service.remove(groupId, tripId);

      expect(repository.removeByTrip).toHaveBeenCalledWith(groupId, tripId);
    });

    it('should throw NotFoundException if group not found', async () => {
      const groupId = 'non-existent';
      const tripId = 'trip-1';

      repository.removeByTrip.mockResolvedValue(false);

      await expect(service.remove(groupId, tripId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove(groupId, tripId)).rejects.toThrow(
        'Grupo de preço não encontrado nesta viagem',
      );
    });
  });
});
