import { Injectable, Logger } from '@nestjs/common';

/**
 * Service to track and manage login attempts
 *
 * Features:
 * - Track failed login attempts per email
 * - Temporary account lockout after max attempts
 * - Automatic unlock after cooldown period
 * - In-memory storage (can be replaced with Redis in production)
 */
@Injectable()
export class LoginAttemptsService {
  private readonly logger = new Logger(LoginAttemptsService.name);
  private readonly attempts = new Map<
    string,
    { count: number; lockedUntil: Date | null }
  >();

  // Configuration
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  /**
   * Record a failed login attempt
   * @param email - User email
   */
  recordFailedAttempt(email: string): void {
    const normalizedEmail = email.toLowerCase();
    const current = this.attempts.get(normalizedEmail) || {
      count: 0,
      lockedUntil: null,
    };

    current.count += 1;

    // Lock account if max attempts reached
    if (current.count >= this.MAX_ATTEMPTS) {
      current.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION_MS);
      this.logger.warn(
        `Account locked: ${normalizedEmail} - Too many failed attempts (${current.count})`,
      );
    }

    this.attempts.set(normalizedEmail, current);
  }

  /**
   * Reset attempts after successful login
   * @param email - User email
   */
  resetAttempts(email: string): void {
    const normalizedEmail = email.toLowerCase();
    this.attempts.delete(normalizedEmail);
  }

  /**
   * Check if account is locked
   * @param email - User email
   * @returns true if account is locked, false otherwise
   */
  isLocked(email: string): boolean {
    const normalizedEmail = email.toLowerCase();
    const current = this.attempts.get(normalizedEmail);

    if (!current || !current.lockedUntil) {
      return false;
    }

    // Check if lockout period has passed
    if (current.lockedUntil < new Date()) {
      // Unlock account
      this.resetAttempts(normalizedEmail);
      return false;
    }

    return true;
  }

  /**
   * Get remaining lockout time in seconds
   * @param email - User email
   * @returns Seconds until unlock, or 0 if not locked
   */
  getLockoutTimeRemaining(email: string): number {
    const normalizedEmail = email.toLowerCase();
    const current = this.attempts.get(normalizedEmail);

    if (!current || !current.lockedUntil) {
      return 0;
    }

    const remaining = Math.ceil(
      (current.lockedUntil.getTime() - Date.now()) / 1000,
    );
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Get current attempt count
   * @param email - User email
   * @returns Number of failed attempts
   */
  getAttemptCount(email: string): number {
    const normalizedEmail = email.toLowerCase();
    const current = this.attempts.get(normalizedEmail);
    return current?.count || 0;
  }

  /**
   * Get remaining attempts before lockout
   * @param email - User email
   * @returns Number of attempts remaining
   */
  getRemainingAttempts(email: string): number {
    const current = this.getAttemptCount(email);
    return Math.max(0, this.MAX_ATTEMPTS - current);
  }
}
