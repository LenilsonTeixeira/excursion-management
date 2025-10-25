import { Test, TestingModule } from '@nestjs/testing';
import { TripGeneralInfoController } from './trip-general-info.controller';
import { TripGeneralInfoService } from './trip-general-info.service';

describe('TripGeneralInfoController', () => {
  let controller: TripGeneralInfoController;
  let service: jest.Mocked<TripGeneralInfoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripGeneralInfoController],
      providers: [
        {
          provide: TripGeneralInfoService,
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

    controller = module.get<TripGeneralInfoController>(
      TripGeneralInfoController,
    );
    service = module.get(TripGeneralInfoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a general info item', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const createDto = {
        title: 'O que está incluído',
        description: 'Transporte e hospedagem',
        displayOrder: 1,
      };

      const createdItem = {
        id: 'info-1',
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
    it('should return all general info items for a trip', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const items = [
        { id: 'info-1', tripId, title: 'Item 1' },
        { id: 'info-2', tripId, title: 'Item 2' },
      ];

      service.findAllByTrip.mockResolvedValue(items as any);

      const result = await controller.findAll(agencyId, tripId);

      expect(service.findAllByTrip).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(items);
    });
  });

  describe('findOne', () => {
    it('should return a single general info item', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const infoId = 'info-1';
      const item = { id: infoId, tripId, title: 'Test' };

      service.findOneByTrip.mockResolvedValue(item as any);

      const result = await controller.findOne(agencyId, tripId, infoId);

      expect(service.findOneByTrip).toHaveBeenCalledWith(infoId, tripId);
      expect(result).toEqual(item);
    });
  });

  describe('update', () => {
    it('should update a general info item', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const infoId = 'info-1';
      const updateDto = {
        title: 'Updated Title',
      };

      const updatedItem = {
        id: infoId,
        tripId,
        title: updateDto.title,
        description: 'Description',
        displayOrder: 1,
      };

      service.updateByTrip.mockResolvedValue(updatedItem as any);

      const result = await controller.update(
        agencyId,
        tripId,
        infoId,
        updateDto,
      );

      expect(service.updateByTrip).toHaveBeenCalledWith(
        infoId,
        tripId,
        updateDto,
      );
      expect(result).toEqual(updatedItem);
    });
  });

  describe('remove', () => {
    it('should remove a general info item', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const infoId = 'info-1';

      service.remove.mockResolvedValue(undefined);

      await controller.remove(agencyId, tripId, infoId);

      expect(service.remove).toHaveBeenCalledWith(infoId, tripId);
    });
  });
});
