import { Injectable, NotFoundException } from '@nestjs/common';
import { TripItemsRepository, TripItem } from './trip-items.repository';
import { TripsRepository } from './trips.repository';
import { CreateTripItemDto } from './dto/create-trip-item.dto';
import { UpdateTripItemDto } from './dto/update-trip-item.dto';

@Injectable()
export class TripItemsService {
  constructor(
    private readonly tripItemsRepository: TripItemsRepository,
    private readonly tripsRepository: TripsRepository,
  ) {}

  async create(
    tripId: string,
    createDto: CreateTripItemDto,
  ): Promise<TripItem> {
    // Verificar se trip existe
    const trip = await this.tripsRepository.findOne(tripId);
    if (!trip) {
      throw new NotFoundException('Viagem não encontrada');
    }

    return this.tripItemsRepository.create(tripId, createDto);
  }

  async findAllByTrip(tripId: string): Promise<TripItem[]> {
    return this.tripItemsRepository.findAllByTrip(tripId);
  }

  async findOne(id: string): Promise<TripItem> {
    const item = await this.tripItemsRepository.findOne(id);
    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }
    return item;
  }

  async findOneByTrip(id: string, tripId: string): Promise<TripItem> {
    const item = await this.tripItemsRepository.findOneByTrip(id, tripId);
    if (!item) {
      throw new NotFoundException('Item não encontrado nesta viagem');
    }
    return item;
  }

  async update(id: string, updateDto: UpdateTripItemDto): Promise<TripItem> {
    const updatedItem = await this.tripItemsRepository.update(id, updateDto);
    if (!updatedItem) {
      throw new NotFoundException('Item não encontrado');
    }
    return updatedItem;
  }

  async updateByTrip(
    id: string,
    tripId: string,
    updateDto: UpdateTripItemDto,
  ): Promise<TripItem> {
    const updatedItem = await this.tripItemsRepository.updateByTrip(
      id,
      tripId,
      updateDto,
    );
    if (!updatedItem) {
      throw new NotFoundException('Item não encontrado nesta viagem');
    }
    return updatedItem;
  }

  async remove(id: string, tripId: string): Promise<void> {
    const deleted = await this.tripItemsRepository.removeByTrip(id, tripId);
    if (!deleted) {
      throw new NotFoundException('Item não encontrado nesta viagem');
    }
  }
}
