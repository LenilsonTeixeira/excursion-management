import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { tripGeneralInfoItems } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateGeneralInfoItemDto } from './dto/create-general-info-item.dto';
import { UpdateGeneralInfoItemDto } from './dto/update-general-info-item.dto';
import * as schema from '../db/schema';

export interface TripGeneralInfoItem {
  id: string;
  tripId: string;
  title: string;
  description: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TripGeneralInfoRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    tripId: string,
    dto: CreateGeneralInfoItemDto,
  ): Promise<TripGeneralInfoItem> {
    const [item] = await this.db
      .insert(tripGeneralInfoItems)
      .values({
        tripId,
        title: dto.title,
        description: dto.description,
        displayOrder: dto.displayOrder,
        updatedAt: new Date(),
      })
      .returning();

    return item as TripGeneralInfoItem;
  }

  async findAllByTrip(tripId: string): Promise<TripGeneralInfoItem[]> {
    const items = await this.db
      .select()
      .from(tripGeneralInfoItems)
      .where(eq(tripGeneralInfoItems.tripId, tripId))
      .orderBy(tripGeneralInfoItems.displayOrder);

    return items as TripGeneralInfoItem[];
  }

  async findOne(id: string): Promise<TripGeneralInfoItem | null> {
    const [item] = await this.db
      .select()
      .from(tripGeneralInfoItems)
      .where(eq(tripGeneralInfoItems.id, id))
      .limit(1);

    return (item as TripGeneralInfoItem) || null;
  }

  async findOneByTrip(
    id: string,
    tripId: string,
  ): Promise<TripGeneralInfoItem | null> {
    const [item] = await this.db
      .select()
      .from(tripGeneralInfoItems)
      .where(
        and(
          eq(tripGeneralInfoItems.id, id),
          eq(tripGeneralInfoItems.tripId, tripId),
        ),
      )
      .limit(1);

    return (item as TripGeneralInfoItem) || null;
  }

  async update(
    id: string,
    dto: UpdateGeneralInfoItemDto,
  ): Promise<TripGeneralInfoItem | null> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.displayOrder !== undefined)
      updateData.displayOrder = dto.displayOrder;

    const [item] = await this.db
      .update(tripGeneralInfoItems)
      .set(updateData)
      .where(eq(tripGeneralInfoItems.id, id))
      .returning();

    return (item as TripGeneralInfoItem) || null;
  }

  async updateByTrip(
    id: string,
    tripId: string,
    dto: UpdateGeneralInfoItemDto,
  ): Promise<TripGeneralInfoItem | null> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.displayOrder !== undefined)
      updateData.displayOrder = dto.displayOrder;

    const [item] = await this.db
      .update(tripGeneralInfoItems)
      .set(updateData)
      .where(
        and(
          eq(tripGeneralInfoItems.id, id),
          eq(tripGeneralInfoItems.tripId, tripId),
        ),
      )
      .returning();

    return (item as TripGeneralInfoItem) || null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(tripGeneralInfoItems)
      .where(eq(tripGeneralInfoItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async removeByTrip(id: string, tripId: string): Promise<boolean> {
    const result = await this.db
      .delete(tripGeneralInfoItems)
      .where(
        and(
          eq(tripGeneralInfoItems.id, id),
          eq(tripGeneralInfoItems.tripId, tripId),
        ),
      );
    return (result.rowCount ?? 0) > 0;
  }
}
