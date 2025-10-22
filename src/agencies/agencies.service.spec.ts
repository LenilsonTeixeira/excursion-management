import { Test, TestingModule } from '@nestjs/testing';
import { AgenciesService } from './agencies.service';
import { AgenciesRepository } from './agencies.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';

describe('AgenciesService', () => {
  let service: AgenciesService;
  let repository: AgenciesRepository;

  const mockAgency = {
    id: 'agency-id-1',
    tenantId: 'tenant-id-1',
    name: 'Agência ABC',
    cadastur: '12.34567.89/0001-12',
    cnpj: '12.345.678/0001-90',
    description: 'Agência de viagens',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCreateAgencyDto: CreateAgencyDto = {
    name: 'Agência ABC',
    cadastur: '12.34567.89/0001-12',
    cnpj: '12.345.678/0001-90',
    description: 'Agência de viagens',
  };

  const mockUpdateAgencyDto: UpdateAgencyDto = {
    name: 'Agência ABC Atualizada',
    description: 'Nova descrição',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgenciesService,
        {
          provide: AgenciesRepository,
          useValue: {
            create: jest.fn(),
            findAllByTenant: jest.fn(),
            findOne: jest.fn(),
            findOneByTenant: jest.fn(),
            findByCadastur: jest.fn(),
            findByCnpj: jest.fn(),
            update: jest.fn(),
            updateByTenant: jest.fn(),
            remove: jest.fn(),
            removeByTenant: jest.fn(),
            countByTenant: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgenciesService>(AgenciesService);
    repository = module.get<AgenciesRepository>(AgenciesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an agency successfully', async () => {
      jest.spyOn(repository, 'findByCadastur').mockResolvedValue(null);
      jest.spyOn(repository, 'findByCnpj').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(mockAgency);

      const result = await service.create('tenant-id-1', mockCreateAgencyDto);

      expect(repository.findByCadastur).toHaveBeenCalledWith(
        mockCreateAgencyDto.cadastur,
      );
      expect(repository.findByCnpj).toHaveBeenCalledWith(
        mockCreateAgencyDto.cnpj,
      );
      expect(repository.create).toHaveBeenCalledWith(
        'tenant-id-1',
        mockCreateAgencyDto,
      );
      expect(result).toEqual(mockAgency);
    });

    it('should throw ConflictException when CADASTUR already exists', async () => {
      jest.spyOn(repository, 'findByCadastur').mockResolvedValue(mockAgency);

      await expect(
        service.create('tenant-id-1', mockCreateAgencyDto),
      ).rejects.toThrow(ConflictException);
      expect(repository.findByCadastur).toHaveBeenCalledWith(
        mockCreateAgencyDto.cadastur,
      );
    });

    it('should throw ConflictException when CNPJ already exists', async () => {
      jest.spyOn(repository, 'findByCadastur').mockResolvedValue(null);
      jest.spyOn(repository, 'findByCnpj').mockResolvedValue(mockAgency);

      await expect(
        service.create('tenant-id-1', mockCreateAgencyDto),
      ).rejects.toThrow(ConflictException);
      expect(repository.findByCnpj).toHaveBeenCalledWith(
        mockCreateAgencyDto.cnpj,
      );
    });
  });

  describe('findAllByTenant', () => {
    it('should return all agencies for a tenant', async () => {
      const agencies = [mockAgency];
      jest.spyOn(repository, 'findAllByTenant').mockResolvedValue(agencies);

      const result = await service.findAllByTenant('tenant-id-1');

      expect(repository.findAllByTenant).toHaveBeenCalledWith('tenant-id-1');
      expect(result).toEqual(agencies);
    });
  });

  describe('findOne', () => {
    it('should return an agency by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockAgency);

      const result = await service.findOne('agency-id-1');

      expect(repository.findOne).toHaveBeenCalledWith('agency-id-1');
      expect(result).toEqual(mockAgency);
    });

    it('should throw NotFoundException when agency not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('agency-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByTenant', () => {
    it('should return an agency by id and tenant', async () => {
      jest.spyOn(repository, 'findOneByTenant').mockResolvedValue(mockAgency);

      const result = await service.findOneByTenant(
        'agency-id-1',
        'tenant-id-1',
      );

      expect(repository.findOneByTenant).toHaveBeenCalledWith(
        'agency-id-1',
        'tenant-id-1',
      );
      expect(result).toEqual(mockAgency);
    });

    it('should throw NotFoundException when agency not found in tenant', async () => {
      jest.spyOn(repository, 'findOneByTenant').mockResolvedValue(null);

      await expect(
        service.findOneByTenant('agency-id-1', 'tenant-id-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an agency successfully', async () => {
      const updatedAgency = { ...mockAgency, ...mockUpdateAgencyDto };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockAgency);
      jest.spyOn(repository, 'findByCadastur').mockResolvedValue(null);
      jest.spyOn(repository, 'findByCnpj').mockResolvedValue(null);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedAgency);

      const result = await service.update('agency-id-1', mockUpdateAgencyDto);

      expect(repository.findOne).toHaveBeenCalledWith('agency-id-1');
      expect(repository.update).toHaveBeenCalledWith(
        'agency-id-1',
        mockUpdateAgencyDto,
      );
      expect(result).toEqual(updatedAgency);
    });

    it('should throw NotFoundException when agency not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update('agency-id-1', mockUpdateAgencyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when CADASTUR already exists', async () => {
      const updateDtoWithCadastur = {
        ...mockUpdateAgencyDto,
        cadastur: '99.99999.99/9999-99',
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockAgency);
      jest.spyOn(repository, 'findByCadastur').mockResolvedValue(mockAgency);

      await expect(
        service.update('agency-id-1', updateDtoWithCadastur),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when CNPJ already exists', async () => {
      const updateDtoWithCnpj = {
        ...mockUpdateAgencyDto,
        cnpj: '99.999.999/9999-99',
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockAgency);
      jest.spyOn(repository, 'findByCadastur').mockResolvedValue(null);
      jest.spyOn(repository, 'findByCnpj').mockResolvedValue(mockAgency);

      await expect(
        service.update('agency-id-1', updateDtoWithCnpj),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateByTenant', () => {
    it('should update an agency by tenant successfully', async () => {
      const updatedAgency = { ...mockAgency, ...mockUpdateAgencyDto };
      jest.spyOn(repository, 'findOneByTenant').mockResolvedValue(mockAgency);
      jest.spyOn(repository, 'findByCadastur').mockResolvedValue(null);
      jest.spyOn(repository, 'findByCnpj').mockResolvedValue(null);
      jest.spyOn(repository, 'updateByTenant').mockResolvedValue(updatedAgency);

      const result = await service.updateByTenant(
        'agency-id-1',
        'tenant-id-1',
        mockUpdateAgencyDto,
      );

      expect(repository.findOneByTenant).toHaveBeenCalledWith(
        'agency-id-1',
        'tenant-id-1',
      );
      expect(repository.updateByTenant).toHaveBeenCalledWith(
        'agency-id-1',
        'tenant-id-1',
        mockUpdateAgencyDto,
      );
      expect(result).toEqual(updatedAgency);
    });

    it('should throw NotFoundException when agency not found in tenant', async () => {
      jest.spyOn(repository, 'findOneByTenant').mockResolvedValue(null);

      await expect(
        service.updateByTenant(
          'agency-id-1',
          'tenant-id-1',
          mockUpdateAgencyDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an agency successfully', async () => {
      jest.spyOn(repository, 'remove').mockResolvedValue(true);

      await service.remove('agency-id-1');

      expect(repository.remove).toHaveBeenCalledWith('agency-id-1');
    });

    it('should throw NotFoundException when agency not found', async () => {
      jest.spyOn(repository, 'remove').mockResolvedValue(false);

      await expect(service.remove('agency-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeByTenant', () => {
    it('should remove an agency by tenant successfully', async () => {
      jest.spyOn(repository, 'removeByTenant').mockResolvedValue(true);

      await service.removeByTenant('agency-id-1', 'tenant-id-1');

      expect(repository.removeByTenant).toHaveBeenCalledWith(
        'agency-id-1',
        'tenant-id-1',
      );
    });

    it('should throw NotFoundException when agency not found in tenant', async () => {
      jest.spyOn(repository, 'removeByTenant').mockResolvedValue(false);

      await expect(
        service.removeByTenant('agency-id-1', 'tenant-id-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('countByTenant', () => {
    it('should return count of agencies for a tenant', async () => {
      jest.spyOn(repository, 'countByTenant').mockResolvedValue(5);

      const result = await service.countByTenant('tenant-id-1');

      expect(repository.countByTenant).toHaveBeenCalledWith('tenant-id-1');
      expect(result).toBe(5);
    });
  });
});
