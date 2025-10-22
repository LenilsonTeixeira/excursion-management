import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

/**
 * Hash Service with configurable bcrypt rounds
 *
 * Default: 10 rounds (recommended for most applications)
 * Higher rounds = more secure but slower
 * Configure via BCRYPT_ROUNDS environment variable
 */
@Injectable()
export class HashService {
  private readonly saltRounds: number;

  constructor(private configService: ConfigService) {
    // Get bcrypt rounds from config, default to 10
    this.saltRounds = this.configService.get<number>('BCRYPT_ROUNDS') || 10;
  }

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare a plain text password with a hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns true if password matches hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Get current salt rounds configuration
   * @returns Number of salt rounds
   */
  getSaltRounds(): number {
    return this.saltRounds;
  }
}
