import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AgencyEmailsService } from './agency-emails.service';
import { AgencyEmailsRepository } from './agency-emails.repository';
import { AgenciesRepository } from './agencies.repository';
import { CreateAgencyEmailDto } from './dto/create-agency-email.dto';
import { UpdateAgencyEmailDto } from './dto/create-agency-email.dto';

describe('AgencyEmailsService', () => {
  let service: AgencyEmailsService;
  let emailsRepository: jest.Mocked<AgencyEmailsRepository>;
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

  const mockEmail = {
    id: 'email-1',
    agencyId: 'agency-1',
    type: 'main',
    email: 'contato@agencia.com',
    isMain: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgencyEmailsService,
        {
          provide: AgencyEmailsRepository,
          useValue: {
            create: jest.fn(),
            findAllByAgency: jest.fn(),
            findOne: jest.fn(),
            findOneByAgency: jest.fn(),
            findMainByAgency: jest.fn(),
            findByEmail: jest.fn(),
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

    service = module.get<AgencyEmailsService>(AgencyEmailsService);
    emailsRepository = module.get(AgencyEmailsRepository);
    agenciesRepository = module.get(AgenciesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEmailDto: CreateAgencyEmailDto = {
      email: 'contato@agencia.com',
    };

    it('should create an email successfully', async () => {
      agenciesRepository.findOne.mockResolvedValue(mockAgency);
      emailsRepository.findByEmail.mockResolvedValue(null);
      emailsRepository.findOneByAgency.mockResolvedValue(null);
      emailsRepository.create.mockResolvedValue(mockEmail);

      const result = await service.create('agency-1', createEmailDto);

      expect(result).toEqual(mockEmail);
      expect(agenciesRepository.findOne).toHaveBeenCalledWith('agency-1');
      expect(emailsRepository.findByEmail).toHaveBeenCalledWith(
        'contato@agencia.com',
      );
      expect(emailsRepository.create).toHaveBeenCalledWith(
        'agency-1',
        createEmailDto,
      );
    });

    it('should throw NotFoundException when agency does not exist', async () => {
      agenciesRepository.findOne.mockResolvedValue(null);

      await expect(service.create('agency-1', createEmailDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      agenciesRepository.findOne.mockResolvedValue(mockAgency);
      emailsRepository.findByEmail.mockResolvedValue(mockEmail);

      await expect(service.create('agency-1', createEmailDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create an email successfully', async () => {
      agenciesRepository.findOne.mockResolvedValue(mockAgency);
      emailsRepository.findByEmail.mockResolvedValue(null);
      emailsRepository.findOneByAgency.mockResolvedValue(null);
      emailsRepository.create.mockResolvedValue(mockEmail);

      const result = await service.create('agency-1', createEmailDto);

      expect(result).toEqual(mockEmail);
      expect(agenciesRepository.findOne).toHaveBeenCalledWith('agency-1');
      expect(emailsRepository.findByEmail).toHaveBeenCalledWith(
        'contato@agencia.com',
      );
      expect(emailsRepository.create).toHaveBeenCalledWith(
        'agency-1',
        createEmailDto,
      );
    });
  });

  describe('update', () => {
    const updateEmailDto: UpdateAgencyEmailDto = {
      email: 'vendas@agencia.com',
    };

    it('should update an email successfully', async () => {
      emailsRepository.findOne.mockResolvedValue(mockEmail);
      emailsRepository.findByEmail.mockResolvedValue(null);
      emailsRepository.update.mockResolvedValue({
        ...mockEmail,
        ...updateEmailDto,
      });

      const result = await service.update('email-1', updateEmailDto);

      expect(result).toEqual({ ...mockEmail, ...updateEmailDto });
      expect(emailsRepository.update).toHaveBeenCalledWith(
        'email-1',
        updateEmailDto,
      );
    });

    it('should throw ConflictException when new email already exists', async () => {
      const existingEmail = { ...mockEmail, id: 'email-2' };
      emailsRepository.findOne.mockResolvedValue(mockEmail);
      emailsRepository.findByEmail.mockResolvedValue(existingEmail);

      await expect(service.update('email-1', updateEmailDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should not check email conflict when email is not being updated', async () => {
      const updateDto = { email: 'vendas@agencia.com' };
      emailsRepository.findOne.mockResolvedValue(mockEmail);
      emailsRepository.findByEmail.mockResolvedValue(null);
      emailsRepository.update.mockResolvedValue({ ...mockEmail, ...updateDto });

      const result = await service.update('email-1', updateDto);

      expect(result).toEqual({ ...mockEmail, ...updateDto });
      expect(emailsRepository.findByEmail).toHaveBeenCalledWith(
        'vendas@agencia.com',
      );
    });
  });
});
