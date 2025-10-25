import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { tripImages } from '../db/schema';
import { eq, and } from 'drizzle-orm';
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

@Injectable()
export class TripImagesRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    tripId: string,
    imageUrl: string,
    thumbnailUrl: string,
    displayOrder: number,
    isMain: boolean,
  ): Promise<TripImage> {
    const [image] = await this.db
      .insert(tripImages)
      .values({
        tripId,
        imageUrl,
        thumbnailUrl,
        displayOrder,
        isMain,
        updatedAt: new Date(),
      })
      .returning();

    return image as TripImage;
  }

  async findAllByTrip(tripId: string): Promise<TripImage[]> {
    const images = await this.db
      .select()
      .from(tripImages)
      .where(eq(tripImages.tripId, tripId))
      .orderBy(tripImages.displayOrder);

    return images as TripImage[];
  }

  async findOne(id: string): Promise<TripImage | null> {
    const [image] = await this.db
      .select()
      .from(tripImages)
      .where(eq(tripImages.id, id))
      .limit(1);

    return (image as TripImage) || null;
  }

  async findOneByTrip(id: string, tripId: string): Promise<TripImage | null> {
    const [image] = await this.db
      .select()
      .from(tripImages)
      .where(and(eq(tripImages.id, id), eq(tripImages.tripId, tripId)))
      .limit(1);

    return (image as TripImage) || null;
  }

  async findMainImageByTrip(tripId: string): Promise<TripImage | null> {
    const [image] = await this.db
      .select()
      .from(tripImages)
      .where(and(eq(tripImages.tripId, tripId), eq(tripImages.isMain, true)))
      .limit(1);

    return (image as TripImage) || null;
  }

  async update(
    id: string,
    updates: {
      imageUrl?: string;
      thumbnailUrl?: string;
      displayOrder?: number;
      isMain?: boolean;
    },
  ): Promise<TripImage | null> {
    const updateData: any = {
      updatedAt: new Date(),
      ...updates,
    };

    const [image] = await this.db
      .update(tripImages)
      .set(updateData)
      .where(eq(tripImages.id, id))
      .returning();

    return (image as TripImage) || null;
  }

  async unsetAllMainImages(tripId: string): Promise<void> {
    await this.db
      .update(tripImages)
      .set({ isMain: false, updatedAt: new Date() })
      .where(eq(tripImages.tripId, tripId));
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(tripImages)
      .where(eq(tripImages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async removeByTrip(id: string, tripId: string): Promise<boolean> {
    const result = await this.db
      .delete(tripImages)
      .where(and(eq(tripImages.id, id), eq(tripImages.tripId, tripId)));
    return (result.rowCount ?? 0) > 0;
  }
}
