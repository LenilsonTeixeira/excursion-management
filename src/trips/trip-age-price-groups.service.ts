import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  TripAgePriceGroupsRepository,
  TripAgePriceGroup,
} from './trip-age-price-groups.repository';
import { TripsRepository } from './trips.repository';
import { CreateTripAgePriceGroupDto } from './dto/create-trip-age-price-group.dto';
import { UpdateTripAgePriceGroupDto } from './dto/update-trip-age-price-group.dto';

@Injectable()
export class TripAgePriceGroupsService {
  constructor(
    private readonly priceGroupsRepository: TripAgePriceGroupsRepository,
    private readonly tripsRepository: TripsRepository,
  ) {}

  async create(
    tripId: string,
    createDto: CreateTripAgePriceGroupDto,
  ): Promise<TripAgePriceGroup> {
    // Verificar se trip existe
    const trip = await this.tripsRepository.findOne(tripId);
    if (!trip) {
      throw new NotFoundException('Viagem não encontrada');
    }

    // Validar que originalPrice é maior que finalPrice se fornecido
    if (
      createDto.originalPrice !== undefined &&
      createDto.originalPrice <= createDto.finalPrice
    ) {
      throw new BadRequestException(
        'O preço original deve ser maior que o preço final',
      );
    }

    return this.priceGroupsRepository.create(tripId, createDto);
  }

  async findAllByTrip(tripId: string): Promise<TripAgePriceGroup[]> {
    return this.priceGroupsRepository.findAllByTrip(tripId);
  }

  async findOne(id: string): Promise<TripAgePriceGroup> {
    const priceGroup = await this.priceGroupsRepository.findOne(id);
    if (!priceGroup) {
      throw new NotFoundException('Grupo de preço não encontrado');
    }
    return priceGroup;
  }

  async findOneByTrip(id: string, tripId: string): Promise<TripAgePriceGroup> {
    const priceGroup = await this.priceGroupsRepository.findOneByTrip(
      id,
      tripId,
    );
    if (!priceGroup) {
      throw new NotFoundException('Grupo de preço não encontrado nesta viagem');
    }
    return priceGroup;
  }

  async update(
    id: string,
    updateDto: UpdateTripAgePriceGroupDto,
  ): Promise<TripAgePriceGroup> {
    // Buscar o grupo de preço atual para validação
    const currentGroup = await this.priceGroupsRepository.findOne(id);
    if (!currentGroup) {
      throw new NotFoundException('Grupo de preço não encontrado');
    }

    // Validar que originalPrice é maior que finalPrice se ambos forem fornecidos
    const finalPrice =
      updateDto.finalPrice ?? parseFloat(currentGroup.finalPrice);
    const originalPrice =
      updateDto.originalPrice !== undefined
        ? updateDto.originalPrice
        : currentGroup.originalPrice
          ? parseFloat(currentGroup.originalPrice)
          : undefined;

    if (originalPrice !== undefined && originalPrice <= finalPrice) {
      throw new BadRequestException(
        'O preço original deve ser maior que o preço final',
      );
    }

    const updatedGroup = await this.priceGroupsRepository.update(id, updateDto);
    if (!updatedGroup) {
      throw new NotFoundException('Grupo de preço não encontrado');
    }
    return updatedGroup;
  }

  async updateByTrip(
    id: string,
    tripId: string,
    updateDto: UpdateTripAgePriceGroupDto,
  ): Promise<TripAgePriceGroup> {
    // Buscar o grupo de preço atual para validação
    const currentGroup = await this.priceGroupsRepository.findOneByTrip(
      id,
      tripId,
    );
    if (!currentGroup) {
      throw new NotFoundException('Grupo de preço não encontrado nesta viagem');
    }

    // Validar que originalPrice é maior que finalPrice se ambos forem fornecidos
    const finalPrice =
      updateDto.finalPrice ?? parseFloat(currentGroup.finalPrice);
    const originalPrice =
      updateDto.originalPrice !== undefined
        ? updateDto.originalPrice
        : currentGroup.originalPrice
          ? parseFloat(currentGroup.originalPrice)
          : undefined;

    if (originalPrice !== undefined && originalPrice <= finalPrice) {
      throw new BadRequestException(
        'O preço original deve ser maior que o preço final',
      );
    }

    const updatedGroup = await this.priceGroupsRepository.updateByTrip(
      id,
      tripId,
      updateDto,
    );
    if (!updatedGroup) {
      throw new NotFoundException('Grupo de preço não encontrado nesta viagem');
    }
    return updatedGroup;
  }

  async remove(id: string, tripId: string): Promise<void> {
    const deleted = await this.priceGroupsRepository.removeByTrip(id, tripId);
    if (!deleted) {
      throw new NotFoundException('Grupo de preço não encontrado nesta viagem');
    }
  }
}
