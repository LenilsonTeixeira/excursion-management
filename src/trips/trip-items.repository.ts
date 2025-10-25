import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { tripItems } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateTripItemDto } from './dto/create-trip-item.dto';
import { UpdateTripItemDto } from './dto/update-trip-item.dto';
import * as schema from '../db/schema';

export interface TripItem {
  id: string;
  tripId: string;
  name: string;
  isIncluded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TripItemsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(tripId: string, dto: CreateTripItemDto): Promise<TripItem> {
    const [item] = await this.db
      .insert(tripItems)
      .values({
        tripId,
        name: dto.name,
        isIncluded: dto.isIncluded,
        updatedAt: new Date(),
      })
      .returning();

    return item as TripItem;
  }

  async findAllByTrip(tripId: string): Promise<TripItem[]> {
    const items = await this.db
      .select()
      .from(tripItems)
      .where(eq(tripItems.tripId, tripId));

    return items as TripItem[];
  }

  async findOne(id: string): Promise<TripItem | null> {
    const [item] = await this.db
      .select()
      .from(tripItems)
      .where(eq(tripItems.id, id))
      .limit(1);

    return (item as TripItem) || null;
  }

  async findOneByTrip(id: string, tripId: string): Promise<TripItem | null> {
    const [item] = await this.db
      .select()
      .from(tripItems)
      .where(and(eq(tripItems.id, id), eq(tripItems.tripId, tripId)))
      .limit(1);

    return (item as TripItem) || null;
  }

  async update(id: string, dto: UpdateTripItemDto): Promise<TripItem | null> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.isIncluded !== undefined) updateData.isIncluded = dto.isIncluded;

    const [item] = await this.db
      .update(tripItems)
      .set(updateData)
      .where(eq(tripItems.id, id))
      .returning();

    return (item as TripItem) || null;
  }

  async updateByTrip(
    id: string,
    tripId: string,
    dto: UpdateTripItemDto,
  ): Promise<TripItem | null> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.isIncluded !== undefined) updateData.isIncluded = dto.isIncluded;

    const [item] = await this.db
      .update(tripItems)
      .set(updateData)
      .where(and(eq(tripItems.id, id), eq(tripItems.tripId, tripId)))
      .returning();

    return (item as TripItem) || null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db.delete(tripItems).where(eq(tripItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async removeByTrip(id: string, tripId: string): Promise<boolean> {
    const result = await this.db
      .delete(tripItems)
      .where(and(eq(tripItems.id, id), eq(tripItems.tripId, tripId)));
    return (result.rowCount ?? 0) > 0;
  }
}
