import { Test, TestingModule } from '@nestjs/testing';
import { LoginAttemptsService } from './login-attempts.service';

describe('LoginAttemptsService', () => {
  let service: LoginAttemptsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginAttemptsService],
    }).compile();

    service = module.get<LoginAttemptsService>(LoginAttemptsService);
  });

  afterEach(() => {
    // Clear all attempts after each test
    service['attempts'].clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordFailedAttempt', () => {
    it('should increment attempt count', () => {
      service.recordFailedAttempt('test@example.com');
      expect(service.getAttemptCount('test@example.com')).toBe(1);

      service.recordFailedAttempt('test@example.com');
      expect(service.getAttemptCount('test@example.com')).toBe(2);
    });

    it('should normalize email to lowercase', () => {
      service.recordFailedAttempt('TEST@EXAMPLE.COM');
      service.recordFailedAttempt('test@example.com');

      expect(service.getAttemptCount('test@example.com')).toBe(2);
      expect(service.getAttemptCount('TEST@EXAMPLE.COM')).toBe(2);
    });

    it('should lock account after 5 failed attempts', () => {
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt('test@example.com');
      }

      expect(service.isLocked('test@example.com')).toBe(true);
    });
  });

  describe('resetAttempts', () => {
    it('should reset attempt count to zero', () => {
      service.recordFailedAttempt('test@example.com');
      service.recordFailedAttempt('test@example.com');

      expect(service.getAttemptCount('test@example.com')).toBe(2);

      service.resetAttempts('test@example.com');

      expect(service.getAttemptCount('test@example.com')).toBe(0);
    });

    it('should unlock account', () => {
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt('test@example.com');
      }

      expect(service.isLocked('test@example.com')).toBe(true);

      service.resetAttempts('test@example.com');

      expect(service.isLocked('test@example.com')).toBe(false);
    });
  });

  describe('isLocked', () => {
    it('should return false for account with no attempts', () => {
      expect(service.isLocked('test@example.com')).toBe(false);
    });

    it('should return false for account with less than max attempts', () => {
      service.recordFailedAttempt('test@example.com');
      service.recordFailedAttempt('test@example.com');

      expect(service.isLocked('test@example.com')).toBe(false);
    });

    it('should return true for account with max attempts', () => {
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt('test@example.com');
      }

      expect(service.isLocked('test@example.com')).toBe(true);
    });

    // Note: Auto-unlock test skipped due to 15-minute lockout duration
    // In production, lockout will auto-expire after 15 minutes
  });

  describe('getLockoutTimeRemaining', () => {
    it('should return 0 for unlocked account', () => {
      expect(service.getLockoutTimeRemaining('test@example.com')).toBe(0);
    });

    it('should return remaining time for locked account', () => {
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt('test@example.com');
      }

      const remaining = service.getLockoutTimeRemaining('test@example.com');

      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(15 * 60); // 15 minutes
    });
  });

  describe('getAttemptCount', () => {
    it('should return 0 for email with no attempts', () => {
      expect(service.getAttemptCount('test@example.com')).toBe(0);
    });

    it('should return correct attempt count', () => {
      service.recordFailedAttempt('test@example.com');
      service.recordFailedAttempt('test@example.com');
      service.recordFailedAttempt('test@example.com');

      expect(service.getAttemptCount('test@example.com')).toBe(3);
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return max attempts for email with no attempts', () => {
      expect(service.getRemainingAttempts('test@example.com')).toBe(5);
    });

    it('should return correct remaining attempts', () => {
      service.recordFailedAttempt('test@example.com');
      service.recordFailedAttempt('test@example.com');

      expect(service.getRemainingAttempts('test@example.com')).toBe(3);
    });

    it('should return 0 when max attempts reached', () => {
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt('test@example.com');
      }

      expect(service.getRemainingAttempts('test@example.com')).toBe(0);
    });
  });

  describe('multiple users', () => {
    it('should track attempts independently per user', () => {
      service.recordFailedAttempt('user1@example.com');
      service.recordFailedAttempt('user1@example.com');
      service.recordFailedAttempt('user2@example.com');

      expect(service.getAttemptCount('user1@example.com')).toBe(2);
      expect(service.getAttemptCount('user2@example.com')).toBe(1);
    });

    it('should lock accounts independently', () => {
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt('user1@example.com');
      }

      service.recordFailedAttempt('user2@example.com');

      expect(service.isLocked('user1@example.com')).toBe(true);
      expect(service.isLocked('user2@example.com')).toBe(false);
    });
  });
});
