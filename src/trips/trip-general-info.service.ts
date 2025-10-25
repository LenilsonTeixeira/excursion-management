import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TripGeneralInfoRepository,
  TripGeneralInfoItem,
} from './trip-general-info.repository';
import { TripsRepository } from './trips.repository';
import { CreateGeneralInfoItemDto } from './dto/create-general-info-item.dto';
import { UpdateGeneralInfoItemDto } from './dto/update-general-info-item.dto';

@Injectable()
export class TripGeneralInfoService {
  constructor(
    private readonly tripGeneralInfoRepository: TripGeneralInfoRepository,
    private readonly tripsRepository: TripsRepository,
  ) {}

  async create(
    tripId: string,
    createDto: CreateGeneralInfoItemDto,
  ): Promise<TripGeneralInfoItem> {
    // Verificar se trip existe
    const trip = await this.tripsRepository.findOne(tripId);
    if (!trip) {
      throw new NotFoundException('Viagem não encontrada');
    }

    return this.tripGeneralInfoRepository.create(tripId, createDto);
  }

  async findAllByTrip(tripId: string): Promise<TripGeneralInfoItem[]> {
    return this.tripGeneralInfoRepository.findAllByTrip(tripId);
  }

  async findOne(id: string): Promise<TripGeneralInfoItem> {
    const item = await this.tripGeneralInfoRepository.findOne(id);
    if (!item) {
      throw new NotFoundException('Item de informação não encontrado');
    }
    return item;
  }

  async findOneByTrip(
    id: string,
    tripId: string,
  ): Promise<TripGeneralInfoItem> {
    const item = await this.tripGeneralInfoRepository.findOneByTrip(id, tripId);
    if (!item) {
      throw new NotFoundException(
        'Item de informação não encontrado nesta viagem',
      );
    }
    return item;
  }

  async update(
    id: string,
    updateDto: UpdateGeneralInfoItemDto,
  ): Promise<TripGeneralInfoItem> {
    const updatedItem = await this.tripGeneralInfoRepository.update(
      id,
      updateDto,
    );
    if (!updatedItem) {
      throw new NotFoundException('Item de informação não encontrado');
    }
    return updatedItem;
  }

  async updateByTrip(
    id: string,
    tripId: string,
    updateDto: UpdateGeneralInfoItemDto,
  ): Promise<TripGeneralInfoItem> {
    const updatedItem = await this.tripGeneralInfoRepository.updateByTrip(
      id,
      tripId,
      updateDto,
    );
    if (!updatedItem) {
      throw new NotFoundException(
        'Item de informação não encontrado nesta viagem',
      );
    }
    return updatedItem;
  }

  async remove(id: string, tripId: string): Promise<void> {
    const deleted = await this.tripGeneralInfoRepository.removeByTrip(
      id,
      tripId,
    );
    if (!deleted) {
      throw new NotFoundException(
        'Item de informação não encontrado nesta viagem',
      );
    }
  }
}
