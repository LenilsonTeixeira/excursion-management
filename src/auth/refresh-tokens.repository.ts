import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gt, lt } from 'drizzle-orm';
import { refreshTokens } from '../db/schema';
import { DATABASE } from '../db/database.module';
import * as schema from '../db/schema';

export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: CreateRefreshTokenData) {
    const [token] = await this.db
      .insert(refreshTokens)
      .values(data)
      .returning();

    return token;
  }

  async findByTokenHash(tokenHash: string) {
    const [token] = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          eq(refreshTokens.revoked, 'false'),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      );

    return token;
  }

  async revoke(id: string) {
    const [token] = await this.db
      .update(refreshTokens)
      .set({
        revoked: 'true',
        revokedAt: new Date(),
      })
      .where(eq(refreshTokens.id, id))
      .returning();

    return token;
  }

  async revokeByTokenHash(tokenHash: string) {
    const [token] = await this.db
      .update(refreshTokens)
      .set({
        revoked: 'true',
        revokedAt: new Date(),
      })
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .returning();

    return token;
  }

  async revokeAllForUser(userId: string) {
    await this.db
      .update(refreshTokens)
      .set({
        revoked: 'true',
        revokedAt: new Date(),
      })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.revoked, 'false'),
        ),
      );
  }

  async cleanupExpired() {
    const now = new Date();
    await this.db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, now));
  }
}
