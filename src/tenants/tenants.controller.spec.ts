import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

describe('TenantsController', () => {
  let controller: TenantsController;

  const mockTenant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Empresa Teste',
    slug: 'empresa-teste',
    plan: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);

    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'Empresa Teste',
        slug: 'empresa-teste',
        plan: 'free',
      };

      mockService.create.mockResolvedValue(mockTenant);

      const result = await controller.create(createTenantDto);

      expect(result).toEqual(mockTenant);
      expect(mockService.create).toHaveBeenCalledWith(createTenantDto);
      expect(mockService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de tenants', async () => {
      const tenants = [mockTenant];
      mockService.findAll.mockResolvedValue(tenants);

      const result = await controller.findAll();

      expect(result).toEqual(tenants);
      expect(mockService.findAll).toHaveBeenCalled();
      expect(mockService.findAll).toHaveBeenCalledTimes(1);
    });

    it('deve retornar uma lista vazia', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um tenant pelo ID', async () => {
      mockService.findOne.mockResolvedValue(mockTenant);

      const result = await controller.findOne(mockTenant.id);

      expect(result).toEqual(mockTenant);
      expect(mockService.findOne).toHaveBeenCalledWith(mockTenant.id);
      expect(mockService.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('deve atualizar um tenant', async () => {
      const updateTenantDto: UpdateTenantDto = {
        name: 'Empresa Atualizada',
        plan: 'premium',
      };
      const updatedTenant = { ...mockTenant, ...updateTenantDto };

      mockService.update.mockResolvedValue(updatedTenant);

      const result = await controller.update(mockTenant.id, updateTenantDto);

      expect(result).toEqual(updatedTenant);
      expect(mockService.update).toHaveBeenCalledWith(
        mockTenant.id,
        updateTenantDto,
      );
      expect(mockService.update).toHaveBeenCalledTimes(1);
    });

    it('deve atualizar parcialmente um tenant', async () => {
      const updateTenantDto: UpdateTenantDto = {
        plan: 'enterprise',
      };
      const updatedTenant = { ...mockTenant, ...updateTenantDto };

      mockService.update.mockResolvedValue(updatedTenant);

      const result = await controller.update(mockTenant.id, updateTenantDto);

      expect(result).toEqual(updatedTenant);
      expect(mockService.update).toHaveBeenCalledWith(
        mockTenant.id,
        updateTenantDto,
      );
    });
  });

  describe('remove', () => {
    it('deve remover um tenant', async () => {
      mockService.remove.mockResolvedValue(mockTenant);

      const result = await controller.remove(mockTenant.id);

      expect(result).toEqual(mockTenant);
      expect(mockService.remove).toHaveBeenCalledWith(mockTenant.id);
      expect(mockService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
