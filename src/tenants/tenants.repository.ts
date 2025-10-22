import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import * as schema from '../db/schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsRepository {
  constructor(
    @Inject(DATABASE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(createTenantDto: CreateTenantDto) {
    const [tenant] = await this.db
      .insert(schema.tenants)
      .values(createTenantDto)
      .returning();

    return tenant;
  }

  async findAll() {
    return await this.db.select().from(schema.tenants);
  }

  async findOne(id: string) {
    const [tenant] = await this.db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.id, id))
      .limit(1);

    return tenant;
  }

  async findBySlug(slug: string) {
    const [tenant] = await this.db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.slug, slug))
      .limit(1);

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const [tenant] = await this.db
      .update(schema.tenants)
      .set({
        ...updateTenantDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.tenants.id, id))
      .returning();

    return tenant;
  }

  async remove(id: string) {
    const [tenant] = await this.db
      .delete(schema.tenants)
      .where(eq(schema.tenants.id, id))
      .returning();

    return tenant;
  }
}
