import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AgencyPhonesService } from './agency-phones.service';
import { AgencyPhonesRepository } from './agency-phones.repository';
import { AgenciesRepository } from './agencies.repository';
import { CreateAgencyPhoneDto } from './dto/create-agency-phone.dto';
import { UpdateAgencyPhoneDto } from './dto/create-agency-phone.dto';

describe('AgencyPhonesService', () => {
  let service: AgencyPhonesService;
  let phonesRepository: jest.Mocked<AgencyPhonesRepository>;
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

  const mockPhone = {
    id: 'phone-1',
    agencyId: 'agency-1',
    type: 'main',
    number: '(11) 99999-9999',
    isMain: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgencyPhonesService,
        {
          provide: AgencyPhonesRepository,
          useValue: {
            create: jest.fn(),
            findAllByAgency: jest.fn(),
            findOne: jest.fn(),
            findOneByAgency: jest.fn(),
            findByTypeAndAgency: jest.fn(),
            findByNumber: jest.fn(),
            update: jest.fn(),
            updateByAgency: jest.fn(),
            remove: jest.fn(),
            removeByAgency: jest.fn(),
            countByAgency: jest.fn(),
            validateAgencyAccess: jest.fn(),
            validateTenantAccess: jest.fn(),
            validateAgencyOwnership: jest.fn(),
            validateAgencyTenantOwnership: jest.fn(),
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

    service = module.get<AgencyPhonesService>(AgencyPhonesService);
    phonesRepository = module.get(AgencyPhonesRepository);
    agenciesRepository = module.get(AgenciesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPhoneDto: CreateAgencyPhoneDto = {
      type: 'main',
      number: '(11) 99999-9999',
    };

    it('should create a phone successfully', async () => {
      agenciesRepository.findOne.mockResolvedValue(mockAgency);
      phonesRepository.findByNumber.mockResolvedValue(null);
      phonesRepository.findByTypeAndAgency.mockResolvedValue(null);
      phonesRepository.create.mockResolvedValue(mockPhone);

      const result = await service.create('agency-1', createPhoneDto);

      expect(result).toEqual(mockPhone);
      expect(agenciesRepository.findOne).toHaveBeenCalledWith('agency-1');
      expect(phonesRepository.findByNumber).toHaveBeenCalledWith(
        '(11) 99999-9999',
      );
      expect(phonesRepository.create).toHaveBeenCalledWith(
        'agency-1',
        createPhoneDto,
      );
    });

    it('should throw NotFoundException when agency does not exist', async () => {
      agenciesRepository.findOne.mockResolvedValue(null);

      await expect(service.create('agency-1', createPhoneDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when phone number already exists', async () => {
      agenciesRepository.findOne.mockResolvedValue(mockAgency);
      phonesRepository.findByNumber.mockResolvedValue(mockPhone);

      await expect(service.create('agency-1', createPhoneDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create a phone successfully', async () => {
      agenciesRepository.findOne.mockResolvedValue(mockAgency);
      phonesRepository.findByNumber.mockResolvedValue(null);
      phonesRepository.findByTypeAndAgency.mockResolvedValue(null);
      phonesRepository.create.mockResolvedValue(mockPhone);

      const result = await service.create('agency-1', createPhoneDto);

      expect(result).toEqual(mockPhone);
      expect(agenciesRepository.findOne).toHaveBeenCalledWith('agency-1');
      expect(phonesRepository.findByNumber).toHaveBeenCalledWith(
        createPhoneDto.number,
      );
      expect(phonesRepository.create).toHaveBeenCalledWith(
        'agency-1',
        createPhoneDto,
      );
    });
  });

  describe('update', () => {
    const updatePhoneDto: UpdateAgencyPhoneDto = {
      number: '(21) 88888-8888',
    };

    it('should update a phone successfully', async () => {
      phonesRepository.findOne.mockResolvedValue(mockPhone);
      phonesRepository.findByNumber.mockResolvedValue(null);
      phonesRepository.update.mockResolvedValue({
        ...mockPhone,
        ...updatePhoneDto,
      });

      const result = await service.update('phone-1', updatePhoneDto);

      expect(result).toEqual({ ...mockPhone, ...updatePhoneDto });
      expect(phonesRepository.update).toHaveBeenCalledWith(
        'phone-1',
        updatePhoneDto,
      );
    });

    it('should throw ConflictException when new number already exists', async () => {
      const existingPhone = { ...mockPhone, id: 'phone-2' };
      phonesRepository.findOne.mockResolvedValue(mockPhone);
      phonesRepository.findByNumber.mockResolvedValue(existingPhone);

      await expect(service.update('phone-1', updatePhoneDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should not check number conflict when number is not being updated', async () => {
      const updateDto = { type: 'mobile' };
      phonesRepository.findOne.mockResolvedValue(mockPhone);
      phonesRepository.update.mockResolvedValue({ ...mockPhone, ...updateDto });

      const result = await service.update('phone-1', updateDto);

      expect(result).toEqual({ ...mockPhone, ...updateDto });
      expect(phonesRepository.findByNumber).not.toHaveBeenCalled();
    });
  });
});
