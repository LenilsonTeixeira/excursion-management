import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { tripCategories } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateTripCategoryDto } from './dto/create-trip-category.dto';
import { UpdateTripCategoryDto } from './dto/update-trip-category.dto';
import * as schema from '../db/schema';

export interface TripCategory {
  id: string;
  name: string;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TripCategoriesRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    agencyId: string,
    createTripCategoryDto: CreateTripCategoryDto,
  ): Promise<TripCategory> {
    const [tripCategory] = await this.db
      .insert(tripCategories)
      .values({
        agencyId,
        ...createTripCategoryDto,
        updatedAt: new Date(),
      })
      .returning();

    return tripCategory as TripCategory;
  }

  async findAllByAgency(agencyId: string): Promise<TripCategory[]> {
    const result = await this.db
      .select()
      .from(tripCategories)
      .where(eq(tripCategories.agencyId, agencyId))
      .orderBy(tripCategories.createdAt);

    return result as TripCategory[];
  }

  async findOne(id: string): Promise<TripCategory | null> {
    const [tripCategory] = await this.db
      .select()
      .from(tripCategories)
      .where(eq(tripCategories.id, id))
      .limit(1);

    return tripCategory as TripCategory | null;
  }

  async findOneByAgency(
    id: string,
    agencyId: string,
  ): Promise<TripCategory | null> {
    const [tripCategory] = await this.db
      .select()
      .from(tripCategories)
      .where(
        and(eq(tripCategories.id, id), eq(tripCategories.agencyId, agencyId)),
      )
      .limit(1);

    return tripCategory as TripCategory | null;
  }

  async findByNameAndAgency(
    name: string,
    agencyId: string,
  ): Promise<TripCategory | null> {
    const [tripCategory] = await this.db
      .select()
      .from(tripCategories)
      .where(
        and(
          eq(tripCategories.name, name),
          eq(tripCategories.agencyId, agencyId),
        ),
      )
      .limit(1);

    return tripCategory as TripCategory | null;
  }

  async update(
    id: string,
    updateTripCategoryDto: UpdateTripCategoryDto,
  ): Promise<TripCategory | null> {
    const [tripCategory] = await this.db
      .update(tripCategories)
      .set({
        ...updateTripCategoryDto,
        updatedAt: new Date(),
      })
      .where(eq(tripCategories.id, id))
      .returning();

    return tripCategory as TripCategory | null;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateTripCategoryDto: UpdateTripCategoryDto,
  ): Promise<TripCategory | null> {
    const [tripCategory] = await this.db
      .update(tripCategories)
      .set({
        ...updateTripCategoryDto,
        updatedAt: new Date(),
      })
      .where(
        and(eq(tripCategories.id, id), eq(tripCategories.agencyId, agencyId)),
      )
      .returning();

    return tripCategory as TripCategory | null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(tripCategories)
      .where(eq(tripCategories.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  async removeByAgency(id: string, agencyId: string): Promise<boolean> {
    const result = await this.db
      .delete(tripCategories)
      .where(
        and(eq(tripCategories.id, id), eq(tripCategories.agencyId, agencyId)),
      );

    return (result.rowCount ?? 0) > 0;
  }

  async countByAgency(agencyId: string): Promise<number> {
    const result = await this.db
      .select({ count: tripCategories.id })
      .from(tripCategories)
      .where(eq(tripCategories.agencyId, agencyId));

    return result.length;
  }
}
