import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { TenantResolverMiddleware } from './tenant-resolver.middleware';
import { TenantsRepository } from '../../tenants/tenants.repository';

describe('TenantResolverMiddleware', () => {
  let middleware: TenantResolverMiddleware;
  let tenantsRepository: jest.Mocked<TenantsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantResolverMiddleware,
        {
          provide: TenantsRepository,
          useValue: {
            findBySlug: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<TenantResolverMiddleware>(TenantResolverMiddleware);
    tenantsRepository = module.get(TenantsRepository);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('X-Tenant-ID header', () => {
    it('should resolve tenant from X-Tenant-ID header', async () => {
      const mockTenant = {
        id: 'tenant-1',
        slug: 'agencia-test',
        name: 'Test Agency',
      };

      tenantsRepository.findBySlug.mockResolvedValue(mockTenant as any);

      const req = {
        header: jest.fn((name: string) => {
          if (name === 'X-Tenant-ID') return 'agencia-test';
          if (name === 'host') return 'localhost:3000';
          return undefined;
        }),
        path: '/some-route',
        originalUrl: '/some-route',
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(req.tenantId).toBe('tenant-1');
      expect(req.tenantSlug).toBe('agencia-test');
      expect(tenantsRepository.findBySlug).toHaveBeenCalledWith('agencia-test');
      expect(next).toHaveBeenCalled();
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantsRepository.findBySlug.mockResolvedValue(null as any);

      const req = {
        header: jest.fn((name: string) => {
          if (name === 'X-Tenant-ID') return 'non-existent';
          return undefined;
        }),
        path: '/some-route',
        originalUrl: '/some-route',
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn();

      await expect(middleware.use(req, res, next)).rejects.toThrow(
        NotFoundException,
      );
      await expect(middleware.use(req, res, next)).rejects.toThrow(
        'Tenant not found: non-existent',
      );
    });
  });

  describe('Subdomain resolution', () => {
    it('should resolve tenant from subdomain', async () => {
      const mockTenant = {
        id: 'tenant-1',
        slug: 'agencia-test',
        name: 'Test Agency',
      };

      tenantsRepository.findBySlug.mockResolvedValue(mockTenant as any);

      const req = {
        header: jest.fn((name: string) => {
          if (name === 'host') return 'agencia-test.example.com';
          return undefined;
        }),
        path: '/some-route',
        originalUrl: '/some-route',
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(req.tenantId).toBe('tenant-1');
      expect(req.tenantSlug).toBe('agencia-test');
      expect(tenantsRepository.findBySlug).toHaveBeenCalledWith('agencia-test');
      expect(next).toHaveBeenCalled();
    });

    it('should resolve tenant from subdomain with port', async () => {
      const mockTenant = {
        id: 'tenant-1',
        slug: 'agencia-test',
        name: 'Test Agency',
      };

      tenantsRepository.findBySlug.mockResolvedValue(mockTenant as any);

      const req = {
        header: jest.fn((name: string) => {
          if (name === 'host') return 'agencia-test.localhost:3000';
          return undefined;
        }),
        path: '/some-route',
        originalUrl: '/some-route',
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(req.tenantId).toBe('tenant-1');
      expect(req.tenantSlug).toBe('agencia-test');
      expect(next).toHaveBeenCalled();
    });

    it('should return undefined for localhost without subdomain', async () => {
      const req = {
        header: jest.fn((name: string) => {
          if (name === 'host') return 'localhost:3000';
          return undefined;
        }),
        path: '/auth/login',
        originalUrl: '/auth/login',
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(req.tenantId).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should return undefined for www subdomain', async () => {
      const req = {
        header: jest.fn((name: string) => {
          if (name === 'host') return 'www.example.com';
          return undefined;
        }),
        path: '/auth/login',
        originalUrl: '/auth/login',
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(req.tenantId).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Admin and auth routes', () => {
    it('should allow admin routes without tenant', async () => {
      const req = {
        header: jest.fn(() => undefined),
        path: '/admin/tenants',
        originalUrl: '/admin/tenants',
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(req.tenantId).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(tenantsRepository.findBySlug).not.toHaveBeenCalled();
    });

    it('should allow auth routes without tenant', async () => {
      const req = {
        header: jest.fn(() => undefined),
        path: '/auth/login',
        originalUrl: '/auth/login',
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(req.tenantId).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(tenantsRepository.findBySlug).not.toHaveBeenCalled();
    });

    it('should allow API docs routes without tenant', async () => {
      const req = {
        header: jest.fn(() => undefined),
        path: '/api',
        originalUrl: '/api',
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(req.tenantId).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(tenantsRepository.findBySlug).not.toHaveBeenCalled();
    });
  });

  describe('Other routes', () => {
    it('should throw NotFoundException for non-admin routes without tenant', async () => {
      const req = {
        header: jest.fn(() => undefined),
        path: '/excursions',
        originalUrl: '/excursions',
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn();

      await expect(middleware.use(req, res, next)).rejects.toThrow(
        NotFoundException,
      );
      await expect(middleware.use(req, res, next)).rejects.toThrow(
        'Tenant not specified',
      );
    });
  });

  describe('Header priority', () => {
    it('should prioritize X-Tenant-ID header over subdomain', async () => {
      const mockTenant = {
        id: 'tenant-1',
        slug: 'header-tenant',
        name: 'Header Tenant',
      };

      tenantsRepository.findBySlug.mockResolvedValue(mockTenant as any);

      const req = {
        header: jest.fn((name: string) => {
          if (name === 'X-Tenant-ID') return 'header-tenant';
          if (name === 'host') return 'subdomain-tenant.example.com';
          return undefined;
        }),
        path: '/some-route',
        originalUrl: '/some-route',
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(req.tenantId).toBe('tenant-1');
      expect(req.tenantSlug).toBe('header-tenant');
      expect(tenantsRepository.findBySlug).toHaveBeenCalledWith(
        'header-tenant',
      );
      expect(next).toHaveBeenCalled();
    });
  });
});
