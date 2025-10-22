import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { inviteTokens } from '../db/schema';
import { DATABASE } from '../db/database.module';
import * as schema from '../db/schema';

export interface CreateInviteTokenData {
  token: string;
  email: string;
  tenantName: string;
  role: string;
  expiresAt: Date;
}

@Injectable()
export class InviteTokensRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: CreateInviteTokenData) {
    const [inviteToken] = await this.db
      .insert(inviteTokens)
      .values(data)
      .returning();

    return inviteToken;
  }

  async findByToken(token: string) {
    const [inviteToken] = await this.db
      .select()
      .from(inviteTokens)
      .where(
        and(
          eq(inviteTokens.token, token),
          isNull(inviteTokens.usedAt),
          gt(inviteTokens.expiresAt, new Date()),
        ),
      );

    return inviteToken;
  }

  async markAsUsed(id: string) {
    const [updatedToken] = await this.db
      .update(inviteTokens)
      .set({ usedAt: new Date() })
      .where(eq(inviteTokens.id, id))
      .returning();

    return updatedToken;
  }
}
