import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { boardingLocations } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateBoardingLocationDto } from './dto/create-boarding-location.dto';
import { UpdateBoardingLocationDto } from './dto/update-boarding-location.dto';
import * as schema from '../db/schema';

export interface BoardingLocation {
  id: string;
  name: string;
  description?: string;
  city: string;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class BoardingLocationsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    agencyId: string,
    createBoardingLocationDto: CreateBoardingLocationDto,
  ): Promise<BoardingLocation> {
    const [boardingLocation] = await this.db
      .insert(boardingLocations)
      .values({
        agencyId,
        ...createBoardingLocationDto,
        updatedAt: new Date(),
      })
      .returning();

    return boardingLocation as BoardingLocation;
  }

  async findAllByAgency(agencyId: string): Promise<BoardingLocation[]> {
    const result = await this.db
      .select()
      .from(boardingLocations)
      .where(eq(boardingLocations.agencyId, agencyId))
      .orderBy(boardingLocations.createdAt);

    return result as BoardingLocation[];
  }

  async findOne(id: string): Promise<BoardingLocation | null> {
    const [boardingLocation] = await this.db
      .select()
      .from(boardingLocations)
      .where(eq(boardingLocations.id, id))
      .limit(1);

    return boardingLocation as BoardingLocation | null;
  }

  async findOneByAgency(
    id: string,
    agencyId: string,
  ): Promise<BoardingLocation | null> {
    const [boardingLocation] = await this.db
      .select()
      .from(boardingLocations)
      .where(
        and(
          eq(boardingLocations.id, id),
          eq(boardingLocations.agencyId, agencyId),
        ),
      )
      .limit(1);

    return boardingLocation as BoardingLocation | null;
  }

  async update(
    id: string,
    updateBoardingLocationDto: UpdateBoardingLocationDto,
  ): Promise<BoardingLocation | null> {
    const [boardingLocation] = await this.db
      .update(boardingLocations)
      .set({
        ...updateBoardingLocationDto,
        updatedAt: new Date(),
      })
      .where(eq(boardingLocations.id, id))
      .returning();

    return boardingLocation as BoardingLocation | null;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateBoardingLocationDto: UpdateBoardingLocationDto,
  ): Promise<BoardingLocation | null> {
    const [boardingLocation] = await this.db
      .update(boardingLocations)
      .set({
        ...updateBoardingLocationDto,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(boardingLocations.id, id),
          eq(boardingLocations.agencyId, agencyId),
        ),
      )
      .returning();

    return boardingLocation as BoardingLocation | null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(boardingLocations)
      .where(eq(boardingLocations.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  async removeByAgency(id: string, agencyId: string): Promise<boolean> {
    const result = await this.db
      .delete(boardingLocations)
      .where(
        and(
          eq(boardingLocations.id, id),
          eq(boardingLocations.agencyId, agencyId),
        ),
      );

    return (result.rowCount ?? 0) > 0;
  }

  async countByAgency(agencyId: string): Promise<number> {
    const result = await this.db
      .select({ count: boardingLocations.id })
      .from(boardingLocations)
      .where(eq(boardingLocations.agencyId, agencyId));

    return result.length;
  }
}
