import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { agencies } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import * as schema from '../db/schema';

export interface Agency {
  id: string;
  tenantId: string;
  name: string;
  cadastur: string;
  cnpj: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AgenciesRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    tenantId: string,
    createAgencyDto: CreateAgencyDto,
  ): Promise<Agency> {
    const [agency] = await this.db
      .insert(agencies)
      .values({
        tenantId,
        ...createAgencyDto,
        updatedAt: new Date(),
      })
      .returning();

    return agency as Agency;
  }

  async findAllByTenant(tenantId: string): Promise<Agency[]> {
    const result = await this.db
      .select()
      .from(agencies)
      .where(eq(agencies.tenantId, tenantId))
      .orderBy(agencies.createdAt);

    return result as Agency[];
  }

  async findOne(id: string): Promise<Agency | null> {
    const [agency] = await this.db
      .select()
      .from(agencies)
      .where(eq(agencies.id, id))
      .limit(1);

    return agency as Agency | null;
  }

  async findOneByTenant(id: string, tenantId: string): Promise<Agency | null> {
    const [agency] = await this.db
      .select()
      .from(agencies)
      .where(and(eq(agencies.id, id), eq(agencies.tenantId, tenantId)))
      .limit(1);

    return agency as Agency | null;
  }

  async findByCadastur(cadastur: string): Promise<Agency | null> {
    const [agency] = await this.db
      .select()
      .from(agencies)
      .where(eq(agencies.cadastur, cadastur))
      .limit(1);

    return agency as Agency | null;
  }

  async findByCnpj(cnpj: string): Promise<Agency | null> {
    const [agency] = await this.db
      .select()
      .from(agencies)
      .where(eq(agencies.cnpj, cnpj))
      .limit(1);

    return agency as Agency | null;
  }

  async update(
    id: string,
    updateAgencyDto: UpdateAgencyDto,
  ): Promise<Agency | null> {
    const [agency] = await this.db
      .update(agencies)
      .set({
        ...updateAgencyDto,
        updatedAt: new Date(),
      })
      .where(eq(agencies.id, id))
      .returning();

    return agency as Agency | null;
  }

  async updateByTenant(
    id: string,
    tenantId: string,
    updateAgencyDto: UpdateAgencyDto,
  ): Promise<Agency | null> {
    const [agency] = await this.db
      .update(agencies)
      .set({
        ...updateAgencyDto,
        updatedAt: new Date(),
      })
      .where(and(eq(agencies.id, id), eq(agencies.tenantId, tenantId)))
      .returning();

    return agency as Agency | null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db.delete(agencies).where(eq(agencies.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  async removeByTenant(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .delete(agencies)
      .where(and(eq(agencies.id, id), eq(agencies.tenantId, tenantId)));

    return (result.rowCount ?? 0) > 0;
  }

  async countByTenant(tenantId: string): Promise<number> {
    const result = await this.db
      .select({ count: agencies.id })
      .from(agencies)
      .where(eq(agencies.tenantId, tenantId));

    return result.length;
  }
}
