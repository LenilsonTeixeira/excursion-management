import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import {
  trips,
  tripImages,
  tripGeneralInfoItems,
  tripItems,
  tripAgePriceGroups,
  ageRanges,
  agencies,
  categories,
} from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import * as schema from '../db/schema';

export interface TripImage {
  id: string;
  tripId: string;
  imageUrl: string;
  thumbnailUrl: string;
  isMain: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripGeneralInfoItem {
  id: string;
  tripId: string;
  title: string;
  description: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripItem {
  id: string;
  tripId: string;
  name: string;
  isIncluded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Trip {
  id: string;
  slug: string;
  destination: string;
  mainImageUrl?: string;
  mainImageThumbnailUrl?: string;
  videoUrl?: string;
  description?: string;
  departureDate: Date;
  returnDate: Date;
  displayPrice?: string;
  displayLabel?: string;
  totalSeats: number;
  reservedSeats: number;
  availableSeats: number;
  alertLowStockThreshold?: number;
  alertLastSeatsThreshold?: number;
  shareableLink?: string;
  status: string;
  allowSeatSelection: boolean;
  acceptsWaitingList: boolean;
  cancellationPolicyId?: string;
  agencyId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  images?: TripImage[];
  generalInfoItems?: TripGeneralInfoItem[];
  items?: TripItem[];
  agePriceGroups?: TripAgePriceGroup[];
  agency?: {
    id: string;
    name: string;
    cadastur: string;
    cnpj: string;
    description: string | null;
  };
  category?: {
    id: string;
    name: string;
  };
}

@Injectable()
export class TripsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(agencyId: string, createTripDto: CreateTripDto): Promise<Trip> {
    const availableSeats = createTripDto.totalSeats;

    // Gerar shareable link
    const shareableLink = `${process.env.APP_URL || 'http://localhost:3000'}/trips/${agencyId}/${createTripDto.slug}`;

    const [trip] = await this.db
      .insert(trips)
      .values({
        agencyId,
        slug: createTripDto.slug,
        destination: createTripDto.destination,
        description: createTripDto.description,
        videoUrl: createTripDto.videoUrl,
        departureDate: new Date(createTripDto.departureDate),
        returnDate: new Date(createTripDto.returnDate),
        displayPrice: createTripDto.displayPrice?.toString(),
        displayLabel: createTripDto.displayLabel,
        totalSeats: createTripDto.totalSeats,
        reservedSeats: 0,
        availableSeats,
        alertLowStockThreshold: createTripDto.alertLowStockThreshold,
        alertLastSeatsThreshold: createTripDto.alertLastSeatsThreshold,
        shareableLink,
        status: createTripDto.status || 'ACTIVE',
        allowSeatSelection: createTripDto.allowSeatSelection ?? false,
        acceptsWaitingList: createTripDto.acceptsWaitingList ?? false,
        cancellationPolicyId: createTripDto.cancellationPolicyId,
        categoryId: createTripDto.categoryId,
        updatedAt: new Date(),
      })
      .returning();

    return trip as Trip;
  }

  async findAllByAgency(agencyId: string): Promise<Trip[]> {
    const tripsList = await this.db
      .select()
      .from(trips)
      .where(eq(trips.agencyId, agencyId))
      .orderBy(desc(trips.createdAt));

    // Buscar relations para cada trip
    const tripsWithRelations = await Promise.all(
      tripsList.map(async (trip) => {
        const [
          images,
          generalInfo,
          items,
          priceGroupsRaw,
          agencyData,
          categoryData,
        ] = await Promise.all([
          this.db
            .select()
            .from(tripImages)
            .where(eq(tripImages.tripId, trip.id))
            .orderBy(tripImages.displayOrder),
          this.db
            .select()
            .from(tripGeneralInfoItems)
            .where(eq(tripGeneralInfoItems.tripId, trip.id))
            .orderBy(tripGeneralInfoItems.displayOrder),
          this.db.select().from(tripItems).where(eq(tripItems.tripId, trip.id)),
          this.db
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
            .leftJoin(
              ageRanges,
              eq(tripAgePriceGroups.ageRangeId, ageRanges.id),
            )
            .where(eq(tripAgePriceGroups.tripId, trip.id))
            .orderBy(tripAgePriceGroups.displayOrder),
          this.db
            .select()
            .from(agencies)
            .where(eq(agencies.id, trip.agencyId))
            .limit(1),
          this.db
            .select()
            .from(categories)
            .where(eq(categories.id, trip.categoryId))
            .limit(1),
        ]);

        const agePriceGroups = priceGroupsRaw.map((row) => ({
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

        return {
          ...trip,
          images,
          generalInfoItems: generalInfo,
          items,
          agePriceGroups,
          agency: agencyData[0]
            ? {
                id: agencyData[0].id,
                name: agencyData[0].name,
                cadastur: agencyData[0].cadastur,
                cnpj: agencyData[0].cnpj,
                description: agencyData[0].description,
              }
            : undefined,
          category: categoryData[0]
            ? {
                id: categoryData[0].id,
                name: categoryData[0].name,
              }
            : undefined,
        } as Trip;
      }),
    );

    return tripsWithRelations;
  }

  async findOne(id: string): Promise<Trip | null> {
    const [trip] = await this.db
      .select()
      .from(trips)
      .where(eq(trips.id, id))
      .limit(1);

    if (!trip) {
      return null;
    }

    const [
      images,
      generalInfo,
      items,
      priceGroupsRaw,
      agencyData,
      categoryData,
    ] = await Promise.all([
      this.db
        .select()
        .from(tripImages)
        .where(eq(tripImages.tripId, trip.id))
        .orderBy(tripImages.displayOrder),
      this.db
        .select()
        .from(tripGeneralInfoItems)
        .where(eq(tripGeneralInfoItems.tripId, trip.id))
        .orderBy(tripGeneralInfoItems.displayOrder),
      this.db.select().from(tripItems).where(eq(tripItems.tripId, trip.id)),
      this.db
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
        .where(eq(tripAgePriceGroups.tripId, trip.id))
        .orderBy(tripAgePriceGroups.displayOrder),
      this.db
        .select()
        .from(agencies)
        .where(eq(agencies.id, trip.agencyId))
        .limit(1),
      this.db
        .select()
        .from(categories)
        .where(eq(categories.id, trip.categoryId))
        .limit(1),
    ]);

    const agePriceGroups = priceGroupsRaw.map((row) => ({
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

    return {
      ...trip,
      images,
      generalInfoItems: generalInfo,
      items,
      agePriceGroups,
      agency: agencyData[0]
        ? {
            id: agencyData[0].id,
            name: agencyData[0].name,
            cadastur: agencyData[0].cadastur,
            cnpj: agencyData[0].cnpj,
            description: agencyData[0].description,
          }
        : undefined,
      category: categoryData[0]
        ? {
            id: categoryData[0].id,
            name: categoryData[0].name,
          }
        : undefined,
    } as Trip;
  }

  async findOneByAgency(id: string, agencyId: string): Promise<Trip | null> {
    const [trip] = await this.db
      .select()
      .from(trips)
      .where(and(eq(trips.id, id), eq(trips.agencyId, agencyId)))
      .limit(1);

    if (!trip) {
      return null;
    }

    const [
      images,
      generalInfo,
      items,
      priceGroupsRaw,
      agencyData,
      categoryData,
    ] = await Promise.all([
      this.db
        .select()
        .from(tripImages)
        .where(eq(tripImages.tripId, trip.id))
        .orderBy(tripImages.displayOrder),
      this.db
        .select()
        .from(tripGeneralInfoItems)
        .where(eq(tripGeneralInfoItems.tripId, trip.id))
        .orderBy(tripGeneralInfoItems.displayOrder),
      this.db.select().from(tripItems).where(eq(tripItems.tripId, trip.id)),
      this.db
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
        .where(eq(tripAgePriceGroups.tripId, trip.id))
        .orderBy(tripAgePriceGroups.displayOrder),
      this.db
        .select()
        .from(agencies)
        .where(eq(agencies.id, trip.agencyId))
        .limit(1),
      this.db
        .select()
        .from(categories)
        .where(eq(categories.id, trip.categoryId))
        .limit(1),
    ]);

    const agePriceGroups = priceGroupsRaw.map((row) => ({
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

    return {
      ...trip,
      images,
      generalInfoItems: generalInfo,
      items,
      agePriceGroups,
      agency: agencyData[0]
        ? {
            id: agencyData[0].id,
            name: agencyData[0].name,
            cadastur: agencyData[0].cadastur,
            cnpj: agencyData[0].cnpj,
            description: agencyData[0].description,
          }
        : undefined,
      category: categoryData[0]
        ? {
            id: categoryData[0].id,
            name: categoryData[0].name,
          }
        : undefined,
    } as Trip;
  }

  async findBySlugAndAgency(
    slug: string,
    agencyId: string,
  ): Promise<Trip | null> {
    const [trip] = await this.db
      .select()
      .from(trips)
      .where(and(eq(trips.slug, slug), eq(trips.agencyId, agencyId)))
      .limit(1);

    return trip as Trip | null;
  }

  async update(id: string, updateTripDto: UpdateTripDto): Promise<Trip | null> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updateTripDto.slug !== undefined) updateData.slug = updateTripDto.slug;
    if (updateTripDto.destination !== undefined)
      updateData.destination = updateTripDto.destination;
    if (updateTripDto.description !== undefined)
      updateData.description = updateTripDto.description;
    if (updateTripDto.videoUrl !== undefined)
      updateData.videoUrl = updateTripDto.videoUrl;
    if (updateTripDto.departureDate !== undefined)
      updateData.departureDate = new Date(updateTripDto.departureDate);
    if (updateTripDto.returnDate !== undefined)
      updateData.returnDate = new Date(updateTripDto.returnDate);
    if (updateTripDto.displayPrice !== undefined)
      updateData.displayPrice = updateTripDto.displayPrice.toString();
    if (updateTripDto.displayLabel !== undefined)
      updateData.displayLabel = updateTripDto.displayLabel;
    if (updateTripDto.alertLowStockThreshold !== undefined)
      updateData.alertLowStockThreshold = updateTripDto.alertLowStockThreshold;
    if (updateTripDto.alertLastSeatsThreshold !== undefined)
      updateData.alertLastSeatsThreshold =
        updateTripDto.alertLastSeatsThreshold;
    if (updateTripDto.status !== undefined)
      updateData.status = updateTripDto.status;
    if (updateTripDto.allowSeatSelection !== undefined)
      updateData.allowSeatSelection = updateTripDto.allowSeatSelection;
    if (updateTripDto.acceptsWaitingList !== undefined)
      updateData.acceptsWaitingList = updateTripDto.acceptsWaitingList;
    if (updateTripDto.cancellationPolicyId !== undefined)
      updateData.cancellationPolicyId = updateTripDto.cancellationPolicyId;
    if (updateTripDto.categoryId !== undefined)
      updateData.categoryId = updateTripDto.categoryId;

    // Se totalSeats foi atualizado, recalcular availableSeats
    if (updateTripDto.totalSeats !== undefined) {
      const [currentTrip] = await this.db
        .select()
        .from(trips)
        .where(eq(trips.id, id))
        .limit(1);

      if (currentTrip) {
        updateData.totalSeats = updateTripDto.totalSeats;
        updateData.availableSeats =
          updateTripDto.totalSeats - currentTrip.reservedSeats;
      }
    }

    const [trip] = await this.db
      .update(trips)
      .set(updateData)
      .where(eq(trips.id, id))
      .returning();

    if (!trip) {
      return null;
    }

    return this.findOne(id);
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateTripDto: UpdateTripDto,
  ): Promise<Trip | null> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updateTripDto.slug !== undefined) updateData.slug = updateTripDto.slug;
    if (updateTripDto.destination !== undefined)
      updateData.destination = updateTripDto.destination;
    if (updateTripDto.description !== undefined)
      updateData.description = updateTripDto.description;
    if (updateTripDto.videoUrl !== undefined)
      updateData.videoUrl = updateTripDto.videoUrl;
    if (updateTripDto.departureDate !== undefined)
      updateData.departureDate = new Date(updateTripDto.departureDate);
    if (updateTripDto.returnDate !== undefined)
      updateData.returnDate = new Date(updateTripDto.returnDate);
    if (updateTripDto.displayPrice !== undefined)
      updateData.displayPrice = updateTripDto.displayPrice.toString();
    if (updateTripDto.displayLabel !== undefined)
      updateData.displayLabel = updateTripDto.displayLabel;
    if (updateTripDto.alertLowStockThreshold !== undefined)
      updateData.alertLowStockThreshold = updateTripDto.alertLowStockThreshold;
    if (updateTripDto.alertLastSeatsThreshold !== undefined)
      updateData.alertLastSeatsThreshold =
        updateTripDto.alertLastSeatsThreshold;
    if (updateTripDto.status !== undefined)
      updateData.status = updateTripDto.status;
    if (updateTripDto.allowSeatSelection !== undefined)
      updateData.allowSeatSelection = updateTripDto.allowSeatSelection;
    if (updateTripDto.acceptsWaitingList !== undefined)
      updateData.acceptsWaitingList = updateTripDto.acceptsWaitingList;
    if (updateTripDto.cancellationPolicyId !== undefined)
      updateData.cancellationPolicyId = updateTripDto.cancellationPolicyId;
    if (updateTripDto.categoryId !== undefined)
      updateData.categoryId = updateTripDto.categoryId;

    // Se totalSeats foi atualizado, recalcular availableSeats
    if (updateTripDto.totalSeats !== undefined) {
      const [currentTrip] = await this.db
        .select()
        .from(trips)
        .where(and(eq(trips.id, id), eq(trips.agencyId, agencyId)))
        .limit(1);

      if (currentTrip) {
        updateData.totalSeats = updateTripDto.totalSeats;
        updateData.availableSeats =
          updateTripDto.totalSeats - currentTrip.reservedSeats;
      }
    }

    const [trip] = await this.db
      .update(trips)
      .set(updateData)
      .where(and(eq(trips.id, id), eq(trips.agencyId, agencyId)))
      .returning();

    if (!trip) {
      return null;
    }

    return this.findOneByAgency(id, agencyId);
  }

  async updateMainImage(
    tripId: string,
    mainImageUrl: string,
    mainImageThumbnailUrl: string,
  ): Promise<void> {
    await this.db
      .update(trips)
      .set({
        mainImageUrl,
        mainImageThumbnailUrl,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId));
  }

  async updateReservedSeats(
    tripId: string,
    reservedSeats: number,
  ): Promise<void> {
    const [trip] = await this.db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);

    if (trip) {
      const availableSeats = trip.totalSeats - reservedSeats;
      await this.db
        .update(trips)
        .set({
          reservedSeats,
          availableSeats,
          updatedAt: new Date(),
        })
        .where(eq(trips.id, tripId));
    }
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db.delete(trips).where(eq(trips.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async removeByAgency(id: string, agencyId: string): Promise<boolean> {
    const result = await this.db
      .delete(trips)
      .where(and(eq(trips.id, id), eq(trips.agencyId, agencyId)));
    return (result.rowCount ?? 0) > 0;
  }

  async countByAgency(agencyId: string): Promise<number> {
    const result = await this.db
      .select({ count: trips.id })
      .from(trips)
      .where(eq(trips.agencyId, agencyId));
    return result.length;
  }
}
