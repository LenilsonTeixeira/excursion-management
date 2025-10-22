import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { ageRanges } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateAgeRangeDto } from './dto/create-age-range.dto';
import { UpdateAgeRangeDto } from './dto/update-age-range.dto';
import * as schema from '../db/schema';

export interface AgeRange {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  occupiesSeat: boolean;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AgeRangesRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    agencyId: string,
    createAgeRangeDto: CreateAgeRangeDto,
  ): Promise<AgeRange> {
    const [ageRange] = await this.db
      .insert(ageRanges)
      .values({
        agencyId,
        ...createAgeRangeDto,
        updatedAt: new Date(),
      })
      .returning();

    return ageRange as AgeRange;
  }

  async findAllByAgency(agencyId: string): Promise<AgeRange[]> {
    const result = await this.db
      .select()
      .from(ageRanges)
      .where(eq(ageRanges.agencyId, agencyId))
      .orderBy(ageRanges.createdAt);

    return result as AgeRange[];
  }

  async findOne(id: string): Promise<AgeRange | null> {
    const [ageRange] = await this.db
      .select()
      .from(ageRanges)
      .where(eq(ageRanges.id, id))
      .limit(1);

    return ageRange as AgeRange | null;
  }

  async findOneByAgency(
    id: string,
    agencyId: string,
  ): Promise<AgeRange | null> {
    const [ageRange] = await this.db
      .select()
      .from(ageRanges)
      .where(and(eq(ageRanges.id, id), eq(ageRanges.agencyId, agencyId)))
      .limit(1);

    return ageRange as AgeRange | null;
  }

  async findByNameAndAgency(
    name: string,
    agencyId: string,
  ): Promise<AgeRange | null> {
    const [ageRange] = await this.db
      .select()
      .from(ageRanges)
      .where(and(eq(ageRanges.name, name), eq(ageRanges.agencyId, agencyId)))
      .limit(1);

    return ageRange as AgeRange | null;
  }

  async update(
    id: string,
    updateAgeRangeDto: UpdateAgeRangeDto,
  ): Promise<AgeRange | null> {
    const [ageRange] = await this.db
      .update(ageRanges)
      .set({
        ...updateAgeRangeDto,
        updatedAt: new Date(),
      })
      .where(eq(ageRanges.id, id))
      .returning();

    return ageRange as AgeRange | null;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateAgeRangeDto: UpdateAgeRangeDto,
  ): Promise<AgeRange | null> {
    const [ageRange] = await this.db
      .update(ageRanges)
      .set({
        ...updateAgeRangeDto,
        updatedAt: new Date(),
      })
      .where(and(eq(ageRanges.id, id), eq(ageRanges.agencyId, agencyId)))
      .returning();

    return ageRange as AgeRange | null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db.delete(ageRanges).where(eq(ageRanges.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  async removeByAgency(id: string, agencyId: string): Promise<boolean> {
    const result = await this.db
      .delete(ageRanges)
      .where(and(eq(ageRanges.id, id), eq(ageRanges.agencyId, agencyId)));

    return (result.rowCount ?? 0) > 0;
  }

  async countByAgency(agencyId: string): Promise<number> {
    const result = await this.db
      .select({ count: ageRanges.id })
      .from(ageRanges)
      .where(eq(ageRanges.agencyId, agencyId));

    return result.length;
  }
}
