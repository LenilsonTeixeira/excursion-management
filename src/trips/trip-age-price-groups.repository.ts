import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { tripAgePriceGroups, ageRanges } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateTripAgePriceGroupDto } from './dto/create-trip-age-price-group.dto';
import { UpdateTripAgePriceGroupDto } from './dto/update-trip-age-price-group.dto';
import * as schema from '../db/schema';

export interface TripAgePriceGroup {
  id: string;
  tripId: string;
  ageRangeId: string;
  finalPrice: string;
  originalPrice: string | null;
  displayOrder: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  ageRange?: {
    id: string;
    name: string;
    minAge: number;
    maxAge: number;
    occupiesSeat: boolean;
  };
}

@Injectable()
export class TripAgePriceGroupsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    tripId: string,
    dto: CreateTripAgePriceGroupDto,
  ): Promise<TripAgePriceGroup> {
    const [priceGroup] = await this.db
      .insert(tripAgePriceGroups)
      .values({
        tripId,
        ageRangeId: dto.ageRangeId,
        finalPrice: dto.finalPrice.toString(),
        originalPrice: dto.originalPrice?.toString() || null,
        displayOrder: dto.displayOrder,
        description: dto.description || null,
        isActive: dto.isActive ?? true,
        updatedAt: new Date(),
      })
      .returning();

    return priceGroup as TripAgePriceGroup;
  }

  async findAllByTrip(tripId: string): Promise<TripAgePriceGroup[]> {
    const results = await this.db
      .select({
        id: tripAgePriceGroups.id,
        tripId: tripAgePriceGroups.tripId,
        ageRangeId: tripAgePriceGroups.ageRangeId,
        finalPrice: tripAgePriceGroups.finalPrice,
        originalPrice: tripAgePriceGroups.originalPrice,
        displayOrder: tripAgePriceGroups.displayOrder,
        description: tripAgePriceGroups.description,
        isActive: tripAgePriceGroups.isActive,
        createdAt: tripAgePriceGroups.createdAt,
        updatedAt: tripAgePriceGroups.updatedAt,
        ageRange: {
          id: ageRanges.id,
          name: ageRanges.name,
          minAge: ageRanges.minAge,
          maxAge: ageRanges.maxAge,
          occupiesSeat: ageRanges.occupiesSeat,
        },
      })
      .from(tripAgePriceGroups)
      .leftJoin(ageRanges, eq(tripAgePriceGroups.ageRangeId, ageRanges.id))
      .where(eq(tripAgePriceGroups.tripId, tripId))
      .orderBy(tripAgePriceGroups.displayOrder);

    return results.map((row) => ({
      id: row.id,
      tripId: row.tripId,
      ageRangeId: row.ageRangeId,
      finalPrice: row.finalPrice,
      originalPrice: row.originalPrice,
      displayOrder: row.displayOrder,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt!,
      updatedAt: row.updatedAt!,
      ageRange: row.ageRange?.id
        ? {
            id: row.ageRange.id,
            name: row.ageRange.name!,
            minAge: row.ageRange.minAge!,
            maxAge: row.ageRange.maxAge!,
            occupiesSeat: row.ageRange.occupiesSeat!,
          }
        : undefined,
    }));
  }

  async findOne(id: string): Promise<TripAgePriceGroup | null> {
    const [result] = await this.db
      .select({
        id: tripAgePriceGroups.id,
        tripId: tripAgePriceGroups.tripId,
        ageRangeId: tripAgePriceGroups.ageRangeId,
        finalPrice: tripAgePriceGroups.finalPrice,
        originalPrice: tripAgePriceGroups.originalPrice,
        displayOrder: tripAgePriceGroups.displayOrder,
        description: tripAgePriceGroups.description,
        isActive: tripAgePriceGroups.isActive,
        createdAt: tripAgePriceGroups.createdAt,
        updatedAt: tripAgePriceGroups.updatedAt,
        ageRange: {
          id: ageRanges.id,
          name: ageRanges.name,
          minAge: ageRanges.minAge,
          maxAge: ageRanges.maxAge,
          occupiesSeat: ageRanges.occupiesSeat,
        },
      })
      .from(tripAgePriceGroups)
      .leftJoin(ageRanges, eq(tripAgePriceGroups.ageRangeId, ageRanges.id))
      .where(eq(tripAgePriceGroups.id, id))
      .limit(1);

    if (!result) return null;

    return {
      id: result.id,
      tripId: result.tripId,
      ageRangeId: result.ageRangeId,
      finalPrice: result.finalPrice,
      originalPrice: result.originalPrice,
      displayOrder: result.displayOrder,
      description: result.description,
      isActive: result.isActive,
      createdAt: result.createdAt!,
      updatedAt: result.updatedAt!,
      ageRange: result.ageRange?.id
        ? {
            id: result.ageRange.id,
            name: result.ageRange.name!,
            minAge: result.ageRange.minAge!,
            maxAge: result.ageRange.maxAge!,
            occupiesSeat: result.ageRange.occupiesSeat!,
          }
        : undefined,
    };
  }

  async findOneByTrip(
    id: string,
    tripId: string,
  ): Promise<TripAgePriceGroup | null> {
    const [result] = await this.db
      .select({
        id: tripAgePriceGroups.id,
        tripId: tripAgePriceGroups.tripId,
        ageRangeId: tripAgePriceGroups.ageRangeId,
        finalPrice: tripAgePriceGroups.finalPrice,
        originalPrice: tripAgePriceGroups.originalPrice,
        displayOrder: tripAgePriceGroups.displayOrder,
        description: tripAgePriceGroups.description,
        isActive: tripAgePriceGroups.isActive,
        createdAt: tripAgePriceGroups.createdAt,
        updatedAt: tripAgePriceGroups.updatedAt,
        ageRange: {
          id: ageRanges.id,
          name: ageRanges.name,
          minAge: ageRanges.minAge,
          maxAge: ageRanges.maxAge,
          occupiesSeat: ageRanges.occupiesSeat,
        },
      })
      .from(tripAgePriceGroups)
      .leftJoin(ageRanges, eq(tripAgePriceGroups.ageRangeId, ageRanges.id))
      .where(
        and(
          eq(tripAgePriceGroups.id, id),
          eq(tripAgePriceGroups.tripId, tripId),
        ),
      )
      .limit(1);

    if (!result) return null;

    return {
      id: result.id,
      tripId: result.tripId,
      ageRangeId: result.ageRangeId,
      finalPrice: result.finalPrice,
      originalPrice: result.originalPrice,
      displayOrder: result.displayOrder,
      description: result.description,
      isActive: result.isActive,
      createdAt: result.createdAt!,
      updatedAt: result.updatedAt!,
      ageRange: result.ageRange?.id
        ? {
            id: result.ageRange.id,
            name: result.ageRange.name!,
            minAge: result.ageRange.minAge!,
            maxAge: result.ageRange.maxAge!,
            occupiesSeat: result.ageRange.occupiesSeat!,
          }
        : undefined,
    };
  }

  async update(
    id: string,
    dto: UpdateTripAgePriceGroupDto,
  ): Promise<TripAgePriceGroup | null> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.finalPrice !== undefined)
      updateData.finalPrice = dto.finalPrice.toString();
    if (dto.originalPrice !== undefined)
      updateData.originalPrice = dto.originalPrice.toString();
    if (dto.displayOrder !== undefined)
      updateData.displayOrder = dto.displayOrder;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const [priceGroup] = await this.db
      .update(tripAgePriceGroups)
      .set(updateData)
      .where(eq(tripAgePriceGroups.id, id))
      .returning();

    return (priceGroup as TripAgePriceGroup) || null;
  }

  async updateByTrip(
    id: string,
    tripId: string,
    dto: UpdateTripAgePriceGroupDto,
  ): Promise<TripAgePriceGroup | null> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.finalPrice !== undefined)
      updateData.finalPrice = dto.finalPrice.toString();
    if (dto.originalPrice !== undefined)
      updateData.originalPrice = dto.originalPrice.toString();
    if (dto.displayOrder !== undefined)
      updateData.displayOrder = dto.displayOrder;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const [priceGroup] = await this.db
      .update(tripAgePriceGroups)
      .set(updateData)
      .where(
        and(
          eq(tripAgePriceGroups.id, id),
          eq(tripAgePriceGroups.tripId, tripId),
        ),
      )
      .returning();

    return (priceGroup as TripAgePriceGroup) || null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(tripAgePriceGroups)
      .where(eq(tripAgePriceGroups.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async removeByTrip(id: string, tripId: string): Promise<boolean> {
    const result = await this.db
      .delete(tripAgePriceGroups)
      .where(
        and(
          eq(tripAgePriceGroups.id, id),
          eq(tripAgePriceGroups.tripId, tripId),
        ),
      );
    return (result.rowCount ?? 0) > 0;
  }
}
