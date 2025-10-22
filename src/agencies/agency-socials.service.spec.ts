import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AgencySocialsService } from './agency-socials.service';
import { AgencySocialsRepository } from './agency-socials.repository';
import { AgenciesRepository } from './agencies.repository';
import { CreateAgencySocialDto } from './dto/create-agency-social.dto';
import { UpdateAgencySocialDto } from './dto/create-agency-social.dto';

describe('AgencySocialsService', () => {
  let service: AgencySocialsService;
  let socialsRepository: jest.Mocked<AgencySocialsRepository>;
  let agenciesRepository: jest.Mocked<AgenciesRepository>;

  const mockAgency = {
    id: 'agency-1',
    tenantId: 'tenant-1',
    name: 'Test Agency',
    cadastur: '26.00000.10/0001-00',
    cnpj: '00.000.000/0001-00',
    description: 'Test Description',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSocial = {
    id: 'social-1',
    agencyId: 'agency-1',
    type: 'facebook',
    url: 'https://facebook.com/agencia123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgencySocialsService,
        {
          provide: AgencySocialsRepository,
          useValue: {
            create: jest.fn(),
            findAllByAgency: jest.fn(),
            findOne: jest.fn(),
            findOneByAgency: jest.fn(),
            findByTypeAndAgency: jest.fn(),
            update: jest.fn(),
            updateByAgency: jest.fn(),
            remove: jest.fn(),
            removeByAgency: jest.fn(),
            countByAgency: jest.fn(),
          },
        },
        {
          provide: AgenciesRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgencySocialsService>(AgencySocialsService);
    socialsRepository = module.get(AgencySocialsRepository);
    agenciesRepository = module.get(AgenciesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createSocialDto: CreateAgencySocialDto = {
      type: 'facebook',
      url: 'https://facebook.com/agencia123',
    };

    it('should create a social profile successfully', async () => {
      agenciesRepository.findOne.mockResolvedValue(mockAgency);
      socialsRepository.findByTypeAndAgency.mockResolvedValue(null);
      socialsRepository.create.mockResolvedValue(mockSocial);

      const result = await service.create('agency-1', createSocialDto);

      expect(result).toEqual(mockSocial);
      expect(agenciesRepository.findOne).toHaveBeenCalledWith('agency-1');
      expect(socialsRepository.findByTypeAndAgency).toHaveBeenCalledWith(
        'facebook',
        'agency-1',
      );
      expect(socialsRepository.create).toHaveBeenCalledWith(
        'agency-1',
        createSocialDto,
      );
    });

    it('should throw NotFoundException when agency does not exist', async () => {
      agenciesRepository.findOne.mockResolvedValue(null);

      await expect(service.create('agency-1', createSocialDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when platform already exists for agency', async () => {
      agenciesRepository.findOne.mockResolvedValue(mockAgency);
      socialsRepository.findByTypeAndAgency.mockResolvedValue(mockSocial);

      await expect(service.create('agency-1', createSocialDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllByAgency', () => {
    it('should return active social profiles for an agency', async () => {
      agenciesRepository.findOne.mockResolvedValue(mockAgency);
      socialsRepository.findAllByAgency.mockResolvedValue([mockSocial]);

      const result = await service.findAllByAgency('agency-1');

      expect(result).toEqual([mockSocial]);
      expect(agenciesRepository.findOne).toHaveBeenCalledWith('agency-1');
      expect(socialsRepository.findAllByAgency).toHaveBeenCalledWith(
        'agency-1',
      );
    });

    it('should throw NotFoundException when agency does not exist', async () => {
      agenciesRepository.findOne.mockResolvedValue(null);

      await expect(service.findAllByAgency('agency-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateSocialDto: UpdateAgencySocialDto = {
      type: 'instagram',
      url: 'https://instagram.com/agencia123',
    };

    it('should update a social profile successfully', async () => {
      socialsRepository.findOne.mockResolvedValue(mockSocial);
      socialsRepository.findByTypeAndAgency.mockResolvedValue(null);
      socialsRepository.update.mockResolvedValue({
        ...mockSocial,
        ...updateSocialDto,
      });

      const result = await service.update('social-1', updateSocialDto);

      expect(result).toEqual({ ...mockSocial, ...updateSocialDto });
      expect(socialsRepository.update).toHaveBeenCalledWith(
        'social-1',
        updateSocialDto,
      );
    });

    it('should throw ConflictException when new platform already exists for agency', async () => {
      const existingSocial = { ...mockSocial, id: 'social-2' };
      socialsRepository.findOne.mockResolvedValue(mockSocial);
      socialsRepository.findByTypeAndAgency.mockResolvedValue(existingSocial);

      await expect(service.update('social-1', updateSocialDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should not check platform conflict when platform is not being updated', async () => {
      const updateDto = { url: 'https://facebook.com/new-url' };
      socialsRepository.findOne.mockResolvedValue(mockSocial);
      socialsRepository.update.mockResolvedValue({
        ...mockSocial,
        ...updateDto,
      });

      const result = await service.update('social-1', updateDto);

      expect(result).toEqual({ ...mockSocial, ...updateDto });
      expect(socialsRepository.findByTypeAndAgency).not.toHaveBeenCalled();
    });
  });

  describe('findByTypeAndAgency', () => {
    it('should return social profile by platform and agency', async () => {
      socialsRepository.findByTypeAndAgency.mockResolvedValue(mockSocial);

      const result = await service.findByTypeAndAgency('facebook', 'agency-1');

      expect(result).toEqual(mockSocial);
      expect(socialsRepository.findByTypeAndAgency).toHaveBeenCalledWith(
        'facebook',
        'agency-1',
      );
    });

    it('should return null when social profile does not exist', async () => {
      socialsRepository.findByTypeAndAgency.mockResolvedValue(null);

      const result = await service.findByTypeAndAgency('facebook', 'agency-1');

      expect(result).toBeNull();
    });
  });
});
