import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { DATABASE } from '../db/database.module';
import * as schema from '../db/schema';

export interface CreateUserData {
  tenantId?: string;
  email: string;
  passwordHash: string;
  role: string;
  name: string;
}

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: CreateUserData) {
    const [user] = await this.db
      .insert(users)
      .values({
        tenantId: data.tenantId,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        name: data.name,
      })
      .returning();

    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user;
  }

  async findById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));

    return user;
  }

  async findByTenantId(tenantId: string) {
    return this.db.select().from(users).where(eq(users.tenantId, tenantId));
  }
}
