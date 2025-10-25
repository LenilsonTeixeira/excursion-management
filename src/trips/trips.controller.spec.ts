import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

describe('TripsController', () => {
  let controller: TripsController;
  let service: jest.Mocked<TripsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [
        {
          provide: TripsService,
          useValue: {
            create: jest.fn(),
            findAllByAgency: jest.fn(),
            findOne: jest.fn(),
            findOneByAgency: jest.fn(),
            update: jest.fn(),
            updateByAgency: jest.fn(),
            remove: jest.fn(),
            removeByAgency: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TripsController>(TripsController);
    service = module.get(TripsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new trip', async () => {
      const agencyId = 'agency-1';
      const createDto = {
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
        agencyId,
        reservedSeats: 0,
        availableSeats: 50,
        status: 'ACTIVE',
      };

      service.create.mockResolvedValue(createdTrip as any);

      const result = await controller.create(agencyId, createDto as any);

      expect(service.create).toHaveBeenCalledWith(agencyId, createDto);
      expect(result).toEqual(createdTrip);
    });
  });

  describe('findAllByAgency', () => {
    it('should return all trips for an agency', async () => {
      const agencyId = 'agency-1';
      const trips = [
        { id: 'trip-1', destination: 'Ilha Grande' },
        { id: 'trip-2', destination: 'Arraial do Cabo' },
      ];

      service.findAllByAgency.mockResolvedValue(trips as any);

      const result = await controller.findAllByAgency(agencyId);

      expect(service.findAllByAgency).toHaveBeenCalledWith(agencyId);
      expect(result).toEqual(trips);
    });
  });

  describe('findOne', () => {
    it('should return a trip for superadmin', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const user = { role: 'superadmin', userId: 'user-1' };
      const trip = { id: tripId, destination: 'Ilha Grande' };

      service.findOne.mockResolvedValue(trip as any);

      const result = await controller.findOne(agencyId, tripId, user as any);

      expect(service.findOne).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(trip);
    });

    it('should return a trip for agency_admin from their agency', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const user = { role: 'agency_admin', userId: 'user-1' };
      const trip = { id: tripId, destination: 'Ilha Grande' };

      service.findOneByAgency.mockResolvedValue(trip as any);

      const result = await controller.findOne(agencyId, tripId, user as any);

      expect(service.findOneByAgency).toHaveBeenCalledWith(tripId, agencyId);
      expect(result).toEqual(trip);
    });
  });

  describe('update', () => {
    it('should update a trip for superadmin', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const user = { role: 'superadmin', userId: 'user-1' };
      const updateDto = { destination: 'Ilha Grande Updated' };
      const updatedTrip = { id: tripId, ...updateDto };

      service.update.mockResolvedValue(updatedTrip as any);

      const result = await controller.update(
        agencyId,
        tripId,
        updateDto as any,
        user as any,
      );

      expect(service.update).toHaveBeenCalledWith(tripId, updateDto);
      expect(result).toEqual(updatedTrip);
    });

    it('should update a trip for agency_admin from their agency', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const user = { role: 'agency_admin', userId: 'user-1' };
      const updateDto = { destination: 'Ilha Grande Updated' };
      const updatedTrip = { id: tripId, ...updateDto };

      service.updateByAgency.mockResolvedValue(updatedTrip as any);

      const result = await controller.update(
        agencyId,
        tripId,
        updateDto as any,
        user as any,
      );

      expect(service.updateByAgency).toHaveBeenCalledWith(
        tripId,
        agencyId,
        updateDto,
      );
      expect(result).toEqual(updatedTrip);
    });
  });

  describe('remove', () => {
    it('should remove a trip for superadmin', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const user = { role: 'superadmin', userId: 'user-1' };

      service.remove.mockResolvedValue(undefined);

      await controller.remove(agencyId, tripId, user as any);

      expect(service.remove).toHaveBeenCalledWith(tripId);
    });

    it('should remove a trip for agency_admin from their agency', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const user = { role: 'agency_admin', userId: 'user-1' };

      service.removeByAgency.mockResolvedValue(undefined);

      await controller.remove(agencyId, tripId, user as any);

      expect(service.removeByAgency).toHaveBeenCalledWith(tripId, agencyId);
    });
  });
});
