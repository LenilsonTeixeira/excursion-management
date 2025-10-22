import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginAttemptsService } from './login-attempts.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let loginAttemptsService: jest.Mocked<LoginAttemptsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signupAgency: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: LoginAttemptsService,
          useValue: {
            isLocked: jest.fn().mockReturnValue(false),
            recordFailedAttempt: jest.fn(),
            resetAttempts: jest.fn(),
            getRemainingAttempts: jest.fn().mockReturnValue(5),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    loginAttemptsService = module.get(LoginAttemptsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signupAgency', () => {
    it('should call authService.signupAgency with correct params', async () => {
      const signupDto = {
        name: 'Test Agency',
        emailAdmin: 'admin@test.com',
        password: 'Test@123',
        adminName: 'Admin User',
      };

      const mockResult = {
        tenant: {
          id: 'tenant-1',
          slug: 'test-agency',
          name: 'Test Agency',
        },
        user: {
          id: 'user-1',
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'agency_admin',
        },
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      };

      authService.signupAgency.mockResolvedValue(mockResult);

      const result = await controller.signupAgency(signupDto);

      expect(result).toEqual(mockResult);
      expect(authService.signupAgency).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct params', async () => {
      const loginDto = {
        email: 'admin@test.com',
        password: 'Test@123',
      };

      const mockResult = {
        user: {
          id: 'user-1',
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'agency_admin',
          tenantId: 'tenant-1',
        },
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      };

      authService.login.mockResolvedValue(mockResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
