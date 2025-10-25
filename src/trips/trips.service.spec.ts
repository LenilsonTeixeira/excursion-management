import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsRepository } from './trips.repository';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

describe('TripsService', () => {
  let service: TripsService;
  let repository: jest.Mocked<TripsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        {
          provide: TripsRepository,
          useValue: {
            create: jest.fn(),
            findAllByAgency: jest.fn(),
            findOne: jest.fn(),
            findOneByAgency: jest.fn(),
            findBySlugAndAgency: jest.fn(),
            update: jest.fn(),
            updateByAgency: jest.fn(),
            remove: jest.fn(),
            removeByAgency: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    repository = module.get(TripsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new trip', async () => {
      const agencyId = 'agency-1';
      const createDto: CreateTripDto = {
        slug: 'ilha-grande-2023',
        destination: 'Ilha Grande',
        departureDate: '2023-12-20T08:00:00.000Z',
        returnDate: '2023-12-22T18:00:00.000Z',
        totalSeats: 50,
        categoryId: 'category-1',
      };

      const createdTrip = {
        id: 'trip-1',
        ...createDto,
        reservedSeats: 0,
        availableSeats: 50,
        status: 'ACTIVE',
        agencyId,
        shareableLink: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findBySlugAndAgency.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        ...createdTrip,
        shareableLink: `http://localhost:3000/trips/${agencyId}/${createDto.slug}`,
      } as any);

      const result = await service.create(agencyId, createDto);

      expect(repository.findBySlugAndAgency).toHaveBeenCalledWith(
        createDto.slug,
        agencyId,
      );
      expect(repository.create).toHaveBeenCalledWith(agencyId, createDto);
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if slug already exists', async () => {
      const agencyId = 'agency-1';
      const createDto: CreateTripDto = {
        slug: 'ilha-grande-2023',
        destination: 'Ilha Grande',
        departureDate: '2023-12-20T08:00:00.000Z',
        returnDate: '2023-12-22T18:00:00.000Z',
        totalSeats: 50,
        categoryId: 'category-1',
      };

      repository.findBySlugAndAgency.mockResolvedValue({
        id: 'existing-trip',
      } as any);

      await expect(service.create(agencyId, createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(agencyId, createDto)).rejects.toThrow(
        'Slug da viagem já está em uso nesta agência',
      );
    });

    it('should throw BadRequestException if return date is before departure date', async () => {
      const agencyId = 'agency-1';
      const createDto: CreateTripDto = {
        slug: 'ilha-grande-2023',
        destination: 'Ilha Grande',
        departureDate: '2023-12-22T08:00:00.000Z',
        returnDate: '2023-12-20T18:00:00.000Z', // Before departure
        totalSeats: 50,
        categoryId: 'category-1',
      };

      repository.findBySlugAndAgency.mockResolvedValue(null);

      await expect(service.create(agencyId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(agencyId, createDto)).rejects.toThrow(
        'Data de retorno deve ser posterior à data de partida',
      );
    });
  });

  describe('findOne', () => {
    it('should return a trip by id', async () => {
      const tripId = 'trip-1';
      const trip = {
        id: tripId,
        slug: 'ilha-grande-2023',
        destination: 'Ilha Grande',
        totalSeats: 50,
        reservedSeats: 10,
        availableSeats: 40,
      };

      repository.findOne.mockResolvedValue(trip as any);

      const result = await service.findOne(tripId);

      expect(repository.findOne).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(trip);
    });

    it('should throw NotFoundException if trip not found', async () => {
      const tripId = 'non-existent';

      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(tripId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(tripId)).rejects.toThrow(
        'Viagem não encontrada',
      );
    });
  });

  describe('update', () => {
    it('should update a trip', async () => {
      const tripId = 'trip-1';
      const updateDto: UpdateTripDto = {
        destination: 'Ilha Grande - Updated',
      };

      const existingTrip = {
        id: tripId,
        slug: 'ilha-grande-2023',
        destination: 'Ilha Grande',
        totalSeats: 50,
        reservedSeats: 10,
        availableSeats: 40,
        agencyId: 'agency-1',
        departureDate: new Date('2023-12-20'),
        returnDate: new Date('2023-12-22'),
      };

      const updatedTrip = {
        ...existingTrip,
        ...updateDto,
      };

      repository.findOne.mockResolvedValue(existingTrip as any);
      repository.update.mockResolvedValue(updatedTrip as any);

      const result = await service.update(tripId, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith(tripId);
      expect(repository.update).toHaveBeenCalledWith(tripId, updateDto);
      expect(result).toEqual(updatedTrip);
    });

    it('should throw BadRequestException if totalSeats < reservedSeats', async () => {
      const tripId = 'trip-1';
      const updateDto: UpdateTripDto = {
        totalSeats: 5, // Less than reserved
      };

      const existingTrip = {
        id: tripId,
        slug: 'ilha-grande-2023',
        totalSeats: 50,
        reservedSeats: 10,
        agencyId: 'agency-1',
      };

      repository.findOne.mockResolvedValue(existingTrip as any);

      await expect(service.update(tripId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(tripId, updateDto)).rejects.toThrow(
        'Total de vagas (5) não pode ser menor que as vagas já reservadas (10)',
      );
    });
  });

  describe('remove', () => {
    it('should remove a trip', async () => {
      const tripId = 'trip-1';

      repository.remove.mockResolvedValue(true);

      await service.remove(tripId);

      expect(repository.remove).toHaveBeenCalledWith(tripId);
    });

    it('should throw NotFoundException if trip not found', async () => {
      const tripId = 'non-existent';

      repository.remove.mockResolvedValue(false);

      await expect(service.remove(tripId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(tripId)).rejects.toThrow(
        'Viagem não encontrada',
      );
    });
  });
});
