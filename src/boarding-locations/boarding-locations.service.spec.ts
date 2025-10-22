import { Test, TestingModule } from '@nestjs/testing';
import { BoardingLocationsService } from './boarding-locations.service';
import { BoardingLocationsRepository } from './boarding-locations.repository';

describe('BoardingLocationsService', () => {
  let service: BoardingLocationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<BoardingLocationsService>(BoardingLocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
