import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { agencySocials, agencies } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateAgencySocialDto } from './dto/create-agency-social.dto';
import { UpdateAgencySocialDto } from './dto/create-agency-social.dto';
import * as schema from '../db/schema';

export interface AgencySocial {
  id: string;
  agencyId: string;
  type: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AgencySocialsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    agencyId: string,
    createSocialDto: CreateAgencySocialDto,
  ): Promise<AgencySocial> {
    const [social] = await this.db
      .insert(agencySocials)
      .values({
        agencyId,
        ...createSocialDto,
        updatedAt: new Date(),
      })
      .returning();

    return this.mapToAgencySocial(social);
  }

  async findAllByAgency(agencyId: string): Promise<AgencySocial[]> {
    const result = await this.db
      .select()
      .from(agencySocials)
      .where(eq(agencySocials.agencyId, agencyId))
      .orderBy(agencySocials.createdAt);

    return result.map(this.mapToAgencySocial);
  }

  async findOne(id: string): Promise<AgencySocial | null> {
    const [social] = await this.db
      .select()
      .from(agencySocials)
      .where(eq(agencySocials.id, id))
      .limit(1);

    return social ? this.mapToAgencySocial(social) : null;
  }

  async findOneByAgency(
    id: string,
    agencyId: string,
  ): Promise<AgencySocial | null> {
    const [social] = await this.db
      .select()
      .from(agencySocials)
      .where(
        and(eq(agencySocials.id, id), eq(agencySocials.agencyId, agencyId)),
      )
      .limit(1);

    return social ? this.mapToAgencySocial(social) : null;
  }

  async findByTypeAndAgency(
    type: string,
    agencyId: string,
  ): Promise<AgencySocial | null> {
    const [social] = await this.db
      .select()
      .from(agencySocials)
      .where(
        and(eq(agencySocials.type, type), eq(agencySocials.agencyId, agencyId)),
      )
      .limit(1);

    return social ? this.mapToAgencySocial(social) : null;
  }

  async update(
    id: string,
    updateSocialDto: UpdateAgencySocialDto,
  ): Promise<AgencySocial | null> {
    const [social] = await this.db
      .update(agencySocials)
      .set({
        ...updateSocialDto,
        updatedAt: new Date(),
      })
      .where(eq(agencySocials.id, id))
      .returning();

    return social ? this.mapToAgencySocial(social) : null;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateSocialDto: UpdateAgencySocialDto,
  ): Promise<AgencySocial | null> {
    const [social] = await this.db
      .update(agencySocials)
      .set({
        ...updateSocialDto,
        updatedAt: new Date(),
      })
      .where(
        and(eq(agencySocials.id, id), eq(agencySocials.agencyId, agencyId)),
      )
      .returning();

    return social ? this.mapToAgencySocial(social) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(agencySocials)
      .where(eq(agencySocials.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  async removeByAgency(id: string, agencyId: string): Promise<boolean> {
    const result = await this.db
      .delete(agencySocials)
      .where(
        and(eq(agencySocials.id, id), eq(agencySocials.agencyId, agencyId)),
      );

    return (result.rowCount ?? 0) > 0;
  }

  async countByAgency(agencyId: string): Promise<number> {
    const result = await this.db
      .select({ count: agencySocials.id })
      .from(agencySocials)
      .where(eq(agencySocials.agencyId, agencyId));

    return result.length;
  }

  async validateAgencyOwnership(
    socialId: string,
    agencyId: string,
  ): Promise<boolean> {
    const social = await this.findOneByAgency(socialId, agencyId);
    return social !== null;
  }

  async validateAgencyTenantOwnership(
    socialId: string,
    tenantId: string,
  ): Promise<boolean> {
    const [result] = await this.db
      .select()
      .from(agencySocials)
      .innerJoin(agencies, eq(agencySocials.agencyId, agencies.id))
      .where(
        and(eq(agencySocials.id, socialId), eq(agencies.tenantId, tenantId)),
      )
      .limit(1);

    return result !== undefined;
  }

  private mapToAgencySocial(dbSocial: any): AgencySocial {
    return {
      id: dbSocial.id,
      agencyId: dbSocial.agencyId,
      type: dbSocial.type,
      url: dbSocial.url,
      createdAt: dbSocial.createdAt,
      updatedAt: dbSocial.updatedAt,
    };
  }
}
