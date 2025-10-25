import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { categories } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import * as schema from '../db/schema';

export interface Category {
  id: string;
  name: string;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CategoriesRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    agencyId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const [tripCategory] = await this.db
      .insert(categories)
      .values({
        agencyId,
        ...createCategoryDto,
        updatedAt: new Date(),
      })
      .returning();

    return tripCategory as Category;
  }

  async findAllByAgency(agencyId: string): Promise<Category[]> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.agencyId, agencyId))
      .orderBy(categories.createdAt);

    return result as Category[];
  }

  async findOne(id: string): Promise<Category | null> {
    const [tripCategory] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return tripCategory as Category | null;
  }

  async findOneByAgency(
    id: string,
    agencyId: string,
  ): Promise<Category | null> {
    const [tripCategory] = await this.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.agencyId, agencyId)))
      .limit(1);

    return tripCategory as Category | null;
  }

  async findByNameAndAgency(
    name: string,
    agencyId: string,
  ): Promise<Category | null> {
    const [tripCategory] = await this.db
      .select()
      .from(categories)
      .where(and(eq(categories.name, name), eq(categories.agencyId, agencyId)))
      .limit(1);

    return tripCategory as Category | null;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category | null> {
    const [tripCategory] = await this.db
      .update(categories)
      .set({
        ...updateCategoryDto,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return tripCategory as Category | null;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category | null> {
    const [tripCategory] = await this.db
      .update(categories)
      .set({
        ...updateCategoryDto,
        updatedAt: new Date(),
      })
      .where(and(eq(categories.id, id), eq(categories.agencyId, agencyId)))
      .returning();

    return tripCategory as Category | null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(categories)
      .where(eq(categories.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  async removeByAgency(id: string, agencyId: string): Promise<boolean> {
    const result = await this.db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.agencyId, agencyId)));

    return (result.rowCount ?? 0) > 0;
  }

  async countByAgency(agencyId: string): Promise<number> {
    const result = await this.db
      .select({ count: categories.id })
      .from(categories)
      .where(eq(categories.agencyId, agencyId));

    return result.length;
  }
}
