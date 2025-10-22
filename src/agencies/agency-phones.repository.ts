import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { agencyPhones, agencies } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateAgencyPhoneDto } from './dto/create-agency-phone.dto';
import { UpdateAgencyPhoneDto } from './dto/create-agency-phone.dto';
import * as schema from '../db/schema';

export interface AgencyPhone {
  id: string;
  agencyId: string;
  type: string;
  number: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AgencyPhonesRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    agencyId: string,
    createPhoneDto: CreateAgencyPhoneDto,
  ): Promise<AgencyPhone> {
    const [phone] = await this.db
      .insert(agencyPhones)
      .values({
        agencyId,
        ...createPhoneDto,
        updatedAt: new Date(),
      })
      .returning();

    return this.mapToAgencyPhone(phone);
  }

  async findAllByAgency(agencyId: string): Promise<AgencyPhone[]> {
    const result = await this.db
      .select()
      .from(agencyPhones)
      .where(eq(agencyPhones.agencyId, agencyId))
      .orderBy(agencyPhones.createdAt);

    return result.map(this.mapToAgencyPhone);
  }

  async findOne(id: string): Promise<AgencyPhone | null> {
    const [phone] = await this.db
      .select()
      .from(agencyPhones)
      .where(eq(agencyPhones.id, id))
      .limit(1);

    return phone ? this.mapToAgencyPhone(phone) : null;
  }

  async findOneByAgency(
    id: string,
    agencyId: string,
  ): Promise<AgencyPhone | null> {
    const [phone] = await this.db
      .select()
      .from(agencyPhones)
      .where(and(eq(agencyPhones.id, id), eq(agencyPhones.agencyId, agencyId)))
      .limit(1);

    return phone ? this.mapToAgencyPhone(phone) : null;
  }

  async findByTypeAndAgency(
    type: string,
    agencyId: string,
  ): Promise<AgencyPhone | null> {
    const [phone] = await this.db
      .select()
      .from(agencyPhones)
      .where(
        and(eq(agencyPhones.type, type), eq(agencyPhones.agencyId, agencyId)),
      )
      .limit(1);

    return phone ? this.mapToAgencyPhone(phone) : null;
  }

  async findByNumber(number: string): Promise<AgencyPhone | null> {
    const [phone] = await this.db
      .select()
      .from(agencyPhones)
      .where(eq(agencyPhones.number, number))
      .limit(1);

    return phone ? this.mapToAgencyPhone(phone) : null;
  }

  async update(
    id: string,
    updatePhoneDto: UpdateAgencyPhoneDto,
  ): Promise<AgencyPhone | null> {
    const [phone] = await this.db
      .update(agencyPhones)
      .set({
        ...updatePhoneDto,
        updatedAt: new Date(),
      })
      .where(eq(agencyPhones.id, id))
      .returning();

    return phone ? this.mapToAgencyPhone(phone) : null;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updatePhoneDto: UpdateAgencyPhoneDto,
  ): Promise<AgencyPhone | null> {
    const [phone] = await this.db
      .update(agencyPhones)
      .set({
        ...updatePhoneDto,
        updatedAt: new Date(),
      })
      .where(and(eq(agencyPhones.id, id), eq(agencyPhones.agencyId, agencyId)))
      .returning();

    return phone ? this.mapToAgencyPhone(phone) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(agencyPhones)
      .where(eq(agencyPhones.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  async removeByAgency(id: string, agencyId: string): Promise<boolean> {
    const result = await this.db
      .delete(agencyPhones)
      .where(and(eq(agencyPhones.id, id), eq(agencyPhones.agencyId, agencyId)));

    return (result.rowCount ?? 0) > 0;
  }

  async countByAgency(agencyId: string): Promise<number> {
    const result = await this.db
      .select({ count: agencyPhones.id })
      .from(agencyPhones)
      .where(eq(agencyPhones.agencyId, agencyId));

    return result.length;
  }

  async validateAgencyOwnership(
    phoneId: string,
    agencyId: string,
  ): Promise<boolean> {
    const phone = await this.findOneByAgency(phoneId, agencyId);
    return phone !== null;
  }

  async validateAgencyTenantOwnership(
    phoneId: string,
    tenantId: string,
  ): Promise<boolean> {
    const [result] = await this.db
      .select()
      .from(agencyPhones)
      .innerJoin(agencies, eq(agencyPhones.agencyId, agencies.id))
      .where(and(eq(agencyPhones.id, phoneId), eq(agencies.tenantId, tenantId)))
      .limit(1);

    return result !== undefined;
  }

  private mapToAgencyPhone(dbPhone: any): AgencyPhone {
    return {
      id: dbPhone.id,
      agencyId: dbPhone.agencyId,
      type: dbPhone.type,
      number: dbPhone.number,
      createdAt: dbPhone.createdAt,
      updatedAt: dbPhone.updatedAt,
    };
  }
}
