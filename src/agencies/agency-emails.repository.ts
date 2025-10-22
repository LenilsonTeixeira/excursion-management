import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { agencyEmails, agencies } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateAgencyEmailDto } from './dto/create-agency-email.dto';
import { UpdateAgencyEmailDto } from './dto/create-agency-email.dto';
import * as schema from '../db/schema';

export interface AgencyEmail {
  id: string;
  agencyId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AgencyEmailsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    agencyId: string,
    createEmailDto: CreateAgencyEmailDto,
  ): Promise<AgencyEmail> {
    const [email] = await this.db
      .insert(agencyEmails)
      .values({
        agencyId,
        ...createEmailDto,
        updatedAt: new Date(),
      })
      .returning();

    return this.mapToAgencyEmail(email);
  }

  async findAllByAgency(agencyId: string): Promise<AgencyEmail[]> {
    const result = await this.db
      .select()
      .from(agencyEmails)
      .where(eq(agencyEmails.agencyId, agencyId))
      .orderBy(agencyEmails.createdAt);

    return result.map(this.mapToAgencyEmail);
  }

  async findOne(id: string): Promise<AgencyEmail | null> {
    const [email] = await this.db
      .select()
      .from(agencyEmails)
      .where(eq(agencyEmails.id, id))
      .limit(1);

    return email ? this.mapToAgencyEmail(email) : null;
  }

  async findOneByAgency(
    id: string,
    agencyId: string,
  ): Promise<AgencyEmail | null> {
    const [email] = await this.db
      .select()
      .from(agencyEmails)
      .where(and(eq(agencyEmails.id, id), eq(agencyEmails.agencyId, agencyId)))
      .limit(1);

    return email ? this.mapToAgencyEmail(email) : null;
  }

  async findByTypeAndAgency(
    type: string,
    agencyId: string,
  ): Promise<AgencyEmail | null> {
    const [email] = await this.db
      .select()
      .from(agencyEmails)
      .where(and(eq(agencyEmails.agencyId, agencyId)))
      .limit(1);

    return email ? this.mapToAgencyEmail(email) : null;
  }

  async findByEmail(email: string): Promise<AgencyEmail | null> {
    const [result] = await this.db
      .select()
      .from(agencyEmails)
      .where(eq(agencyEmails.email, email))
      .limit(1);

    return result ? this.mapToAgencyEmail(result) : null;
  }

  async update(
    id: string,
    updateEmailDto: UpdateAgencyEmailDto,
  ): Promise<AgencyEmail | null> {
    const [email] = await this.db
      .update(agencyEmails)
      .set({
        ...updateEmailDto,
        updatedAt: new Date(),
      })
      .where(eq(agencyEmails.id, id))
      .returning();

    return email ? this.mapToAgencyEmail(email) : null;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateEmailDto: UpdateAgencyEmailDto,
  ): Promise<AgencyEmail | null> {
    const [email] = await this.db
      .update(agencyEmails)
      .set({
        ...updateEmailDto,
        updatedAt: new Date(),
      })
      .where(and(eq(agencyEmails.id, id), eq(agencyEmails.agencyId, agencyId)))
      .returning();

    return email ? this.mapToAgencyEmail(email) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(agencyEmails)
      .where(eq(agencyEmails.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  async removeByAgency(id: string, agencyId: string): Promise<boolean> {
    const result = await this.db
      .delete(agencyEmails)
      .where(and(eq(agencyEmails.id, id), eq(agencyEmails.agencyId, agencyId)));

    return (result.rowCount ?? 0) > 0;
  }

  async countByAgency(agencyId: string): Promise<number> {
    const result = await this.db
      .select({ count: agencyEmails.id })
      .from(agencyEmails)
      .where(eq(agencyEmails.agencyId, agencyId));

    return result.length;
  }

  async validateAgencyOwnership(
    emailId: string,
    agencyId: string,
  ): Promise<boolean> {
    const email = await this.findOneByAgency(emailId, agencyId);
    return email !== null;
  }

  async validateAgencyTenantOwnership(
    emailId: string,
    tenantId: string,
  ): Promise<boolean> {
    const [result] = await this.db
      .select()
      .from(agencyEmails)
      .innerJoin(agencies, eq(agencyEmails.agencyId, agencies.id))
      .where(and(eq(agencyEmails.id, emailId), eq(agencies.tenantId, tenantId)))
      .limit(1);

    return result !== undefined;
  }

  private mapToAgencyEmail(dbEmail: any): AgencyEmail {
    return {
      id: dbEmail.id,
      agencyId: dbEmail.agencyId,
      email: dbEmail.email,
      createdAt: dbEmail.createdAt,
      updatedAt: dbEmail.updatedAt,
    };
  }
}
