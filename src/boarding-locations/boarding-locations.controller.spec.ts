import { Test, TestingModule } from '@nestjs/testing';
import { BoardingLocationsController } from './boarding-locations.controller';
import { BoardingLocationsService } from './boarding-locations.service';
import { BoardingLocationsRepository } from './boarding-locations.repository';

describe('BoardingLocationsController', () => {
  let controller: BoardingLocationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardingLocationsController],
      providers: [
        BoardingLocationsService,
        {
          provide: BoardingLocationsRepository,
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
    }).compile();

    controller = module.get<BoardingLocationsController>(
      BoardingLocationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
