import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { agencyAddresses, agencies } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateAgencyAddressDto } from './dto/create-agency-address.dto';
import { UpdateAgencyAddressDto } from './dto/create-agency-address.dto';
import * as schema from '../db/schema';

export interface AgencyAddress {
  id: string;
  agencyId: string;
  type: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AgencyAddressesRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    agencyId: string,
    createAddressDto: CreateAgencyAddressDto,
  ): Promise<AgencyAddress> {
    const [address] = await this.db
      .insert(agencyAddresses)
      .values({
        agencyId,
        ...createAddressDto,
        updatedAt: new Date(),
      })
      .returning();

    return this.mapToAgencyAddress(address);
  }

  async findAllByAgency(agencyId: string): Promise<AgencyAddress[]> {
    const result = await this.db
      .select()
      .from(agencyAddresses)
      .where(eq(agencyAddresses.agencyId, agencyId))
      .orderBy(agencyAddresses.createdAt);

    return result.map(this.mapToAgencyAddress);
  }

  async findOne(id: string): Promise<AgencyAddress | null> {
    const [address] = await this.db
      .select()
      .from(agencyAddresses)
      .where(eq(agencyAddresses.id, id))
      .limit(1);

    return address ? this.mapToAgencyAddress(address) : null;
  }

  async findOneByAgency(
    id: string,
    agencyId: string,
  ): Promise<AgencyAddress | null> {
    const [address] = await this.db
      .select()
      .from(agencyAddresses)
      .where(
        and(eq(agencyAddresses.id, id), eq(agencyAddresses.agencyId, agencyId)),
      )
      .limit(1);

    return address ? this.mapToAgencyAddress(address) : null;
  }

  async findByTypeAndAgency(
    type: string,
    agencyId: string,
  ): Promise<AgencyAddress | null> {
    const [address] = await this.db
      .select()
      .from(agencyAddresses)
      .where(
        and(
          eq(agencyAddresses.type, type),
          eq(agencyAddresses.agencyId, agencyId),
        ),
      )
      .limit(1);

    return address ? this.mapToAgencyAddress(address) : null;
  }

  async update(
    id: string,
    updateAddressDto: UpdateAgencyAddressDto,
  ): Promise<AgencyAddress | null> {
    const [address] = await this.db
      .update(agencyAddresses)
      .set({
        ...updateAddressDto,
        updatedAt: new Date(),
      })
      .where(eq(agencyAddresses.id, id))
      .returning();

    return address ? this.mapToAgencyAddress(address) : null;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateAddressDto: UpdateAgencyAddressDto,
  ): Promise<AgencyAddress | null> {
    const [address] = await this.db
      .update(agencyAddresses)
      .set({
        ...updateAddressDto,
        updatedAt: new Date(),
      })
      .where(
        and(eq(agencyAddresses.id, id), eq(agencyAddresses.agencyId, agencyId)),
      )
      .returning();

    return address ? this.mapToAgencyAddress(address) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(agencyAddresses)
      .where(eq(agencyAddresses.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  async removeByAgency(id: string, agencyId: string): Promise<boolean> {
    const result = await this.db
      .delete(agencyAddresses)
      .where(
        and(eq(agencyAddresses.id, id), eq(agencyAddresses.agencyId, agencyId)),
      );

    return (result.rowCount ?? 0) > 0;
  }

  async countByAgency(agencyId: string): Promise<number> {
    const result = await this.db
      .select({ count: agencyAddresses.id })
      .from(agencyAddresses)
      .where(eq(agencyAddresses.agencyId, agencyId));

    return result.length;
  }

  async validateAgencyOwnership(
    addressId: string,
    agencyId: string,
  ): Promise<boolean> {
    const address = await this.findOneByAgency(addressId, agencyId);
    return address !== null;
  }

  async validateAgencyTenantOwnership(
    addressId: string,
    tenantId: string,
  ): Promise<boolean> {
    const [result] = await this.db
      .select()
      .from(agencyAddresses)
      .innerJoin(agencies, eq(agencyAddresses.agencyId, agencies.id))
      .where(
        and(eq(agencyAddresses.id, addressId), eq(agencies.tenantId, tenantId)),
      )
      .limit(1);

    return result !== undefined;
  }

  private mapToAgencyAddress(dbAddress: any): AgencyAddress {
    return {
      id: dbAddress.id,
      agencyId: dbAddress.agencyId,
      type: dbAddress.type,
      address: dbAddress.address,
      number: dbAddress.number,
      complement: dbAddress.complement,
      neighborhood: dbAddress.neighborhood,
      city: dbAddress.city,
      state: dbAddress.state,
      zipCode: dbAddress.zipCode,
      createdAt: dbAddress.createdAt,
      updatedAt: dbAddress.updatedAt,
    };
  }
}
