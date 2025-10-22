import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsRepository } from './tenants.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

describe('TenantsService', () => {
  let service: TenantsService;

  const mockTenant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Empresa Teste',
    slug: 'empresa-teste',
    plan: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: TenantsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);

    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTenantDto: CreateTenantDto = {
      name: 'Empresa Teste',
      slug: 'empresa-teste',
      plan: 'free',
    };

    it('deve criar um tenant com sucesso', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockTenant);

      const result = await service.create(createTenantDto);

      expect(result).toEqual(mockTenant);
      expect(mockRepository.findBySlug).toHaveBeenCalledWith(
        createTenantDto.slug,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(createTenantDto);
    });

    it('deve lançar ConflictException se o slug já existir', async () => {
      mockRepository.findBySlug.mockResolvedValue(mockTenant);

      await expect(service.create(createTenantDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createTenantDto)).rejects.toThrow(
        `Tenant com slug '${createTenantDto.slug}' já existe`,
      );
      expect(mockRepository.findBySlug).toHaveBeenCalledWith(
        createTenantDto.slug,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de tenants', async () => {
      const tenants = [mockTenant];
      mockRepository.findAll.mockResolvedValue(tenants);

      const result = await service.findAll();

      expect(result).toEqual(tenants);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('deve retornar uma lista vazia se não houver tenants', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um tenant pelo ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOne(mockTenant.id);

      expect(result).toEqual(mockTenant);
      expect(mockRepository.findOne).toHaveBeenCalledWith(mockTenant.id);
    });

    it('deve lançar NotFoundException se o tenant não existir', async () => {
      const id = 'id-inexistente';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        `Tenant com ID '${id}' não encontrado`,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    const updateTenantDto: UpdateTenantDto = {
      name: 'Empresa Atualizada',
      plan: 'premium',
    };

    it('deve atualizar um tenant com sucesso', async () => {
      const updatedTenant = { ...mockTenant, ...updateTenantDto };
      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.update.mockResolvedValue(updatedTenant);

      const result = await service.update(mockTenant.id, updateTenantDto);

      expect(result).toEqual(updatedTenant);
      expect(mockRepository.findOne).toHaveBeenCalledWith(mockTenant.id);
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockTenant.id,
        updateTenantDto,
      );
    });

    it('deve lançar NotFoundException se o tenant não existir', async () => {
      const id = 'id-inexistente';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateTenantDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith(id);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se o novo slug já existir', async () => {
      const updateWithSlug: UpdateTenantDto = {
        slug: 'slug-existente',
      };
      const otherTenant = { ...mockTenant, id: 'outro-id' };

      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.findBySlug.mockResolvedValue(otherTenant);

      await expect(
        service.update(mockTenant.id, updateWithSlug),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(mockTenant.id, updateWithSlug),
      ).rejects.toThrow(`Tenant com slug '${updateWithSlug.slug}' já existe`);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('deve permitir atualizar o próprio slug', async () => {
      const updateWithSlug: UpdateTenantDto = {
        slug: mockTenant.slug,
      };
      const updatedTenant = { ...mockTenant, ...updateWithSlug };

      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.findBySlug.mockResolvedValue(mockTenant);
      mockRepository.update.mockResolvedValue(updatedTenant);

      const result = await service.update(mockTenant.id, updateWithSlug);

      expect(result).toEqual(updatedTenant);
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockTenant.id,
        updateWithSlug,
      );
    });
  });

  describe('remove', () => {
    it('deve remover um tenant com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.remove.mockResolvedValue(mockTenant);

      const result = await service.remove(mockTenant.id);

      expect(result).toEqual(mockTenant);
      expect(mockRepository.findOne).toHaveBeenCalledWith(mockTenant.id);
      expect(mockRepository.remove).toHaveBeenCalledWith(mockTenant.id);
    });

    it('deve lançar NotFoundException se o tenant não existir', async () => {
      const id = 'id-inexistente';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith(id);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
