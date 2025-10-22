import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersRepository } from './users.repository';
import { InviteTokensRepository } from './invite-tokens.repository';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { TenantsService } from '../tenants/tenants.service';
import { HashService } from '../common/services/hash.service';
import { EmailService } from '../common/services/email.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let inviteTokensRepository: jest.Mocked<InviteTokensRepository>;
  let refreshTokensRepository: jest.Mocked<RefreshTokensRepository>;
  let tenantsService: jest.Mocked<TenantsService>;
  let hashService: jest.Mocked<HashService>;
  let emailService: jest.Mocked<EmailService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: InviteTokensRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: RefreshTokensRepository,
          useValue: {
            create: jest.fn(),
            findByTokenHash: jest.fn(),
            revoke: jest.fn(),
            revokeByTokenHash: jest.fn(),
          },
        },
        {
          provide: TenantsService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: HashService,
          useValue: {
            hashPassword: jest.fn(),
            comparePassword: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
            sendInviteEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '30d',
                JWT_SECRET: 'test-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(UsersRepository);
    inviteTokensRepository = module.get(InviteTokensRepository);
    refreshTokensRepository = module.get(RefreshTokensRepository);
    tenantsService = module.get(TenantsService);
    hashService = module.get(HashService);
    emailService = module.get(EmailService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signupAgency - self-service flow', () => {
    const signupDto = {
      name: 'Test Agency',
      emailAdmin: 'admin@test.com',
      password: 'Test@123',
      adminName: 'Admin User',
      useInviteFlow: false,
    };

    it('should create agency, admin user and return token', async () => {
      const mockTenant = {
        id: 'tenant-1',
        name: 'Test Agency',
        slug: 'test-agency',
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser = {
        id: 'user-1',
        tenantId: 'tenant-1',
        email: 'admin@test.com',
        passwordHash: 'hashed-password',
        role: 'agency_admin',
        name: 'Admin User',
        isActive: 'true',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersRepository.findByEmail.mockResolvedValue(null as any);
      tenantsService.create.mockResolvedValue(mockTenant as any);
      hashService.hashPassword.mockResolvedValue('hashed-password');
      usersRepository.create.mockResolvedValue(mockUser as any);
      emailService.sendWelcomeEmail.mockResolvedValue();
      jwtService.sign.mockReturnValue('jwt-token');
      refreshTokensRepository.create.mockResolvedValue({} as any);

      const result = await service.signupAgency(signupDto);

      expect(result).toHaveProperty('tenant');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        'admin@test.com',
      );
      expect(tenantsService.create).toHaveBeenCalled();
      expect(hashService.hashPassword).toHaveBeenCalledWith('Test@123');
      expect(usersRepository.create).toHaveBeenCalled();
      expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      usersRepository.findByEmail.mockResolvedValue({
        id: 'existing-user',
      } as any);

      await expect(service.signupAgency(signupDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.signupAgency(signupDto)).rejects.toThrow(
        'Email já cadastrado',
      );
    });
  });

  describe('signupAgency - invite flow', () => {
    const inviteDto = {
      name: 'Test Agency',
      emailAdmin: 'admin@test.com',
      password: 'Test@123',
      useInviteFlow: true,
    };

    it('should create invite token and send email', async () => {
      const mockInviteToken = {
        id: 'invite-1',
        token: 'random-token',
        email: 'admin@test.com',
        tenantName: 'Test Agency',
        role: 'agency_admin',
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      usersRepository.findByEmail.mockResolvedValue(null as any);
      inviteTokensRepository.create.mockResolvedValue(mockInviteToken as any);
      emailService.sendInviteEmail.mockResolvedValue();

      const result = await service.signupAgency(inviteDto);

      expect(result).toMatchObject({
        message: 'Convite enviado com sucesso',
        inviteId: mockInviteToken.id,
        expiresAt: mockInviteToken.expiresAt,
      });

      expect(inviteTokensRepository.create).toHaveBeenCalled();
      expect(emailService.sendInviteEmail).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'admin@test.com',
      password: 'Test@123',
    };

    it('should login successfully and return token', async () => {
      const mockUser = {
        id: 'user-1',
        tenantId: 'tenant-1',
        email: 'admin@test.com',
        passwordHash: 'hashed-password',
        role: 'agency_admin',
        name: 'Admin User',
        isActive: 'true',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersRepository.findByEmail.mockResolvedValue(mockUser as any);
      hashService.comparePassword.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');
      refreshTokensRepository.create.mockResolvedValue({} as any);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');

      expect(hashService.comparePassword).toHaveBeenCalledWith(
        'Test@123',
        'hashed-password',
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersRepository.findByEmail.mockResolvedValue(null as any);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 'user-1',
        passwordHash: 'hashed-password',
      } as any;

      usersRepository.findByEmail.mockResolvedValue(mockUser);
      hashService.comparePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'admin@test.com',
        passwordHash: 'hashed-password',
        isActive: 'false',
      } as any;

      usersRepository.findByEmail.mockResolvedValue(mockUser);
      hashService.comparePassword.mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow('Usuário inativo');
    });
  });

  describe('refresh', () => {
    const refreshDto = {
      refreshToken: 'some-refresh-token',
    };

    it('should refresh tokens successfully', async () => {
      const mockStoredToken = {
        id: 'token-1',
        userId: 'user-1',
        tokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + 86400000),
        revoked: 'false',
      };

      const mockUser = {
        id: 'user-1',
        tenantId: 'tenant-1',
        email: 'admin@test.com',
        passwordHash: 'hashed-password',
        role: 'agency_admin',
        name: 'Admin User',
        isActive: 'true',
      };

      refreshTokensRepository.findByTokenHash.mockResolvedValue(
        mockStoredToken as any,
      );
      usersRepository.findById = jest.fn().mockResolvedValue(mockUser as any);
      refreshTokensRepository.revoke.mockResolvedValue({} as any);
      jwtService.sign.mockReturnValue('new-jwt-token');
      refreshTokensRepository.create.mockResolvedValue({} as any);

      const result = await service.refresh(refreshDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(refreshTokensRepository.findByTokenHash).toHaveBeenCalled();
      expect(refreshTokensRepository.revoke).toHaveBeenCalledWith('token-1');
      expect(refreshTokensRepository.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      refreshTokensRepository.findByTokenHash.mockResolvedValue(null as any);

      await expect(service.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshDto)).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const mockStoredToken = {
        id: 'token-1',
        userId: 'user-1',
      };

      refreshTokensRepository.findByTokenHash.mockResolvedValue(
        mockStoredToken as any,
      );
      usersRepository.findById = jest.fn().mockResolvedValue(null as any);

      await expect(service.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshDto)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const mockStoredToken = {
        id: 'token-1',
        userId: 'user-1',
      };

      const mockUser = {
        id: 'user-1',
        isActive: 'false',
      };

      refreshTokensRepository.findByTokenHash.mockResolvedValue(
        mockStoredToken as any,
      );
      usersRepository.findById = jest.fn().mockResolvedValue(mockUser as any);

      await expect(service.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshDto)).rejects.toThrow(
        'User is inactive',
      );
    });
  });

  describe('logout', () => {
    const logoutDto = {
      refreshToken: 'some-refresh-token',
    };

    it('should logout successfully', async () => {
      refreshTokensRepository.revokeByTokenHash.mockResolvedValue({} as any);

      const result = await service.logout(logoutDto);

      expect(result).toMatchObject({
        message: 'Logout realizado com sucesso',
      });
      expect(refreshTokensRepository.revokeByTokenHash).toHaveBeenCalled();
    });
  });
});
