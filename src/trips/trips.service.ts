import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { TripsRepository, Trip } from './trips.repository';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  constructor(private readonly tripsRepository: TripsRepository) {}

  async create(agencyId: string, createTripDto: CreateTripDto): Promise<Trip> {
    // Validar slug único na agência
    const existingTrip = await this.tripsRepository.findBySlugAndAgency(
      createTripDto.slug,
      agencyId,
    );
    if (existingTrip) {
      throw new ConflictException(
        'Slug da viagem já está em uso nesta agência',
      );
    }

    // Validar datas
    this.validateDates(createTripDto.departureDate, createTripDto.returnDate);

    // Criar trip
    const trip = await this.tripsRepository.create(agencyId, createTripDto);

    return trip;
  }

  async findAllByAgency(agencyId: string): Promise<Trip[]> {
    return this.tripsRepository.findAllByAgency(agencyId);
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.tripsRepository.findOne(id);
    if (!trip) {
      throw new NotFoundException('Viagem não encontrada');
    }
    return trip;
  }

  async findOneByAgency(id: string, agencyId: string): Promise<Trip> {
    const trip = await this.tripsRepository.findOneByAgency(id, agencyId);
    if (!trip) {
      throw new NotFoundException('Viagem não encontrada nesta agência');
    }
    return trip;
  }

  async update(id: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    // Verificar se viagem existe
    const existingTrip = await this.tripsRepository.findOne(id);
    if (!existingTrip) {
      throw new NotFoundException('Viagem não encontrada');
    }

    // Validar slug se foi atualizado
    if (updateTripDto.slug && updateTripDto.slug !== existingTrip.slug) {
      const tripWithSlug = await this.tripsRepository.findBySlugAndAgency(
        updateTripDto.slug,
        existingTrip.agencyId,
      );
      if (tripWithSlug) {
        throw new ConflictException(
          'Slug da viagem já está em uso nesta agência',
        );
      }
    }

    // Validar datas se foram atualizadas
    if (updateTripDto.departureDate || updateTripDto.returnDate) {
      const departureDate =
        updateTripDto.departureDate || existingTrip.departureDate.toISOString();
      const returnDate =
        updateTripDto.returnDate || existingTrip.returnDate.toISOString();
      this.validateDates(departureDate, returnDate);
    }

    // Validar totalSeats se foi atualizado
    if (updateTripDto.totalSeats !== undefined) {
      if (updateTripDto.totalSeats < existingTrip.reservedSeats) {
        throw new BadRequestException(
          `Total de vagas (${updateTripDto.totalSeats}) não pode ser menor que as vagas já reservadas (${existingTrip.reservedSeats})`,
        );
      }
    }

    const updatedTrip = await this.tripsRepository.update(id, updateTripDto);
    if (!updatedTrip) {
      throw new NotFoundException('Viagem não encontrada');
    }

    return updatedTrip;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateTripDto: UpdateTripDto,
  ): Promise<Trip> {
    // Verificar se viagem existe na agência
    const existingTrip = await this.tripsRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!existingTrip) {
      throw new NotFoundException('Viagem não encontrada nesta agência');
    }

    // Validar slug se foi atualizado
    if (updateTripDto.slug && updateTripDto.slug !== existingTrip.slug) {
      const tripWithSlug = await this.tripsRepository.findBySlugAndAgency(
        updateTripDto.slug,
        agencyId,
      );
      if (tripWithSlug) {
        throw new ConflictException(
          'Slug da viagem já está em uso nesta agência',
        );
      }
    }

    // Validar datas se foram atualizadas
    if (updateTripDto.departureDate || updateTripDto.returnDate) {
      const departureDate =
        updateTripDto.departureDate || existingTrip.departureDate.toISOString();
      const returnDate =
        updateTripDto.returnDate || existingTrip.returnDate.toISOString();
      this.validateDates(departureDate, returnDate);
    }

    // Validar totalSeats se foi atualizado
    if (updateTripDto.totalSeats !== undefined) {
      if (updateTripDto.totalSeats < existingTrip.reservedSeats) {
        throw new BadRequestException(
          `Total de vagas (${updateTripDto.totalSeats}) não pode ser menor que as vagas já reservadas (${existingTrip.reservedSeats})`,
        );
      }
    }

    const updatedTrip = await this.tripsRepository.updateByAgency(
      id,
      agencyId,
      updateTripDto,
    );
    if (!updatedTrip) {
      throw new NotFoundException('Viagem não encontrada nesta agência');
    }

    return updatedTrip;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.tripsRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Viagem não encontrada');
    }
  }

  async removeByAgency(id: string, agencyId: string): Promise<void> {
    const deleted = await this.tripsRepository.removeByAgency(id, agencyId);
    if (!deleted) {
      throw new NotFoundException('Viagem não encontrada nesta agência');
    }
  }

  private validateDates(departureDate: string, returnDate: string): void {
    const departure = new Date(departureDate);
    const returnD = new Date(returnDate);

    if (returnD <= departure) {
      throw new BadRequestException(
        'Data de retorno deve ser posterior à data de partida',
      );
    }
  }
}
