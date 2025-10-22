import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AgencyAddressesService } from './agency-addresses.service';
import { AgencyAddressesRepository } from './agency-addresses.repository';
import { AgenciesRepository } from './agencies.repository';
import { CreateAgencyAddressDto } from './dto/create-agency-address.dto';
import { UpdateAgencyAddressDto } from './dto/create-agency-address.dto';

describe('AgencyAddressesService', () => {
  let service: AgencyAddressesService;
  let addressesRepository: jest.Mocked<AgencyAddressesRepository>;
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

  const mockAddress = {
    id: 'address-1',
    agencyId: 'agency-1',
    type: 'main',
    address: 'Rua das Flores',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgencyAddressesService,
        {
          provide: AgencyAddressesRepository,
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

    service = module.get<AgencyAddressesService>(AgencyAddressesService);
    addressesRepository = module.get(AgencyAddressesRepository);
    agenciesRepository = module.get(AgenciesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createAddressDto: CreateAgencyAddressDto = {
      type: 'main',
      address: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    };

    it('should create an address successfully', async () => {
      agenciesRepository.findOne.mockResolvedValue(mockAgency);
      addressesRepository.findOneByAgency.mockResolvedValue(null);
      addressesRepository.create.mockResolvedValue(mockAddress);

      const result = await service.create('agency-1', createAddressDto);

      expect(result).toEqual(mockAddress);
      expect(agenciesRepository.findOne).toHaveBeenCalledWith('agency-1');
      expect(addressesRepository.create).toHaveBeenCalledWith(
        'agency-1',
        createAddressDto,
      );
    });

    it('should throw NotFoundException when agency does not exist', async () => {
      agenciesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create('agency-1', createAddressDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByAgency', () => {
    it('should return all addresses for an agency', async () => {
      agenciesRepository.findOne.mockResolvedValue(mockAgency);
      addressesRepository.findAllByAgency.mockResolvedValue([mockAddress]);

      const result = await service.findAllByAgency('agency-1');

      expect(result).toEqual([mockAddress]);
      expect(agenciesRepository.findOne).toHaveBeenCalledWith('agency-1');
      expect(addressesRepository.findAllByAgency).toHaveBeenCalledWith(
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

  describe('findOne', () => {
    it('should return an address by id', async () => {
      addressesRepository.findOne.mockResolvedValue(mockAddress);

      const result = await service.findOne('address-1');

      expect(result).toEqual(mockAddress);
      expect(addressesRepository.findOne).toHaveBeenCalledWith('address-1');
    });

    it('should throw NotFoundException when address does not exist', async () => {
      addressesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('address-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByAgency', () => {
    it('should return an address by id and agency', async () => {
      addressesRepository.findOneByAgency.mockResolvedValue(mockAddress);

      const result = await service.findOneByAgency('address-1', 'agency-1');

      expect(result).toEqual(mockAddress);
      expect(addressesRepository.findOneByAgency).toHaveBeenCalledWith(
        'address-1',
        'agency-1',
      );
    });

    it('should throw NotFoundException when address does not exist in agency', async () => {
      addressesRepository.findOneByAgency.mockResolvedValue(null);

      await expect(
        service.findOneByAgency('address-1', 'agency-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateAddressDto: UpdateAgencyAddressDto = {
      address: 'Avenida Paulista',
      number: '456',
    };

    it('should update an address successfully', async () => {
      addressesRepository.findOne.mockResolvedValue(mockAddress);
      addressesRepository.update.mockResolvedValue({
        ...mockAddress,
        ...updateAddressDto,
      });

      const result = await service.update('address-1', updateAddressDto);

      expect(result).toEqual({ ...mockAddress, ...updateAddressDto });
      expect(addressesRepository.update).toHaveBeenCalledWith(
        'address-1',
        updateAddressDto,
      );
    });

    it('should throw NotFoundException when address does not exist', async () => {
      addressesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('address-1', updateAddressDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an address successfully', async () => {
      addressesRepository.remove.mockResolvedValue(true);

      await service.remove('address-1');

      expect(addressesRepository.remove).toHaveBeenCalledWith('address-1');
    });

    it('should throw NotFoundException when address does not exist', async () => {
      addressesRepository.remove.mockResolvedValue(false);

      await expect(service.remove('address-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
