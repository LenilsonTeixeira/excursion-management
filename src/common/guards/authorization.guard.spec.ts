import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationGuard } from './authorization.guard';
import { JwtPayload } from '../decorators/current-user.decorator';

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<AuthorizationGuard>(AuthorizationGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('Role-based access control', () => {
    it('should allow access when user has required role', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'admin@test.com',
        role: 'superadmin',
        tenantId: 'tenant-1',
      };

      const context = createMockExecutionContext(user, 'tenant-1');
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['superadmin']);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user lacks required role', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'user@test.com',
        role: 'agent',
        tenantId: 'tenant-1',
      };

      const context = createMockExecutionContext(user, 'tenant-1');
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'roles') return ['agency_admin'];
        if (key === 'requireOwnership') return undefined;
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied. Required roles: agency_admin',
      );
    });

    it('should allow access when user has one of multiple required roles', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'admin@test.com',
        role: 'agency_admin',
        tenantId: 'tenant-1',
      };

      const context = createMockExecutionContext(user, 'tenant-1');
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['agency_admin', 'agent'])
        .mockReturnValueOnce(undefined);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when no roles are required', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'user@test.com',
        role: 'customer',
        tenantId: 'tenant-1',
      };

      const context = createMockExecutionContext(user, 'tenant-1');
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Tenant ownership validation', () => {
    it('should allow superadmin to access any tenant', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'superadmin@test.com',
        role: 'superadmin',
        tenantId: 'tenant-1',
      };

      const context = createMockExecutionContext(user, 'tenant-2');
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(true);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow user to access their own tenant', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'admin@test.com',
        role: 'agency_admin',
        tenantId: 'tenant-1',
      };

      const context = createMockExecutionContext(user, 'tenant-1');
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(true);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny user access to different tenant', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'admin@test.com',
        role: 'agency_admin',
        tenantId: 'tenant-1',
      };

      const context = createMockExecutionContext(user, 'tenant-2');
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'roles') return undefined;
        if (key === 'requireOwnership') return true;
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied. You can only access resources from your own agency.',
      );
    });

    it('should deny access when ownership required but no tenant in request', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'admin@test.com',
        role: 'agency_admin',
        tenantId: 'tenant-1',
      };

      const context = createMockExecutionContext(user, undefined);
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'roles') return undefined;
        if (key === 'requireOwnership') return true;
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Tenant context required for this operation',
      );
    });

    it('should skip ownership check when not required', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'admin@test.com',
        role: 'agency_admin',
        tenantId: 'tenant-1',
      };

      const context = createMockExecutionContext(user, 'tenant-2');
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(false); // requireOwnership = false

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Combined role and ownership checks', () => {
    it('should enforce both role and ownership', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'admin@test.com',
        role: 'agency_admin',
        tenantId: 'tenant-1',
      };

      const context = createMockExecutionContext(user, 'tenant-1');
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['agency_admin'])
        .mockReturnValueOnce(true);

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should allow access when no user is present', () => {
      const context = createMockExecutionContext(undefined, 'tenant-1');
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should handle user without tenantId', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'superadmin@test.com',
        role: 'superadmin',
        tenantId: undefined,
      };

      const context = createMockExecutionContext(user, undefined);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      expect(guard.canActivate(context)).toBe(true);
    });
  });
});

// Helper function to create mock execution context
function createMockExecutionContext(
  user: JwtPayload | undefined,
  tenantId: string | undefined,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        tenantId,
      }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as any;
}
