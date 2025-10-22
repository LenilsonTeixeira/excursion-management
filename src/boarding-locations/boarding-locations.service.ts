import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BoardingLocationsRepository,
  BoardingLocation,
} from './boarding-locations.repository';
import { CreateBoardingLocationDto } from './dto/create-boarding-location.dto';
import { UpdateBoardingLocationDto } from './dto/update-boarding-location.dto';

@Injectable()
export class BoardingLocationsService {
  constructor(
    private readonly boardingLocationsRepository: BoardingLocationsRepository,
  ) {}

  async create(
    agencyId: string,
    createBoardingLocationDto: CreateBoardingLocationDto,
  ): Promise<BoardingLocation> {
    return this.boardingLocationsRepository.create(
      agencyId,
      createBoardingLocationDto,
    );
  }

  async findAllByAgency(agencyId: string): Promise<BoardingLocation[]> {
    return this.boardingLocationsRepository.findAllByAgency(agencyId);
  }

  async findOne(id: string): Promise<BoardingLocation> {
    const boardingLocation = await this.boardingLocationsRepository.findOne(id);
    if (!boardingLocation) {
      throw new NotFoundException('Local de embarque não encontrado');
    }
    return boardingLocation;
  }

  async findOneByAgency(
    id: string,
    agencyId: string,
  ): Promise<BoardingLocation> {
    const boardingLocation =
      await this.boardingLocationsRepository.findOneByAgency(id, agencyId);
    if (!boardingLocation) {
      throw new NotFoundException(
        'Local de embarque não encontrado nesta agência',
      );
    }
    return boardingLocation;
  }

  async update(
    id: string,
    updateBoardingLocationDto: UpdateBoardingLocationDto,
  ): Promise<BoardingLocation> {
    // Verificar se local de embarque existe
    const existingBoardingLocation =
      await this.boardingLocationsRepository.findOne(id);
    if (!existingBoardingLocation) {
      throw new NotFoundException('Local de embarque não encontrado');
    }

    const updatedBoardingLocation =
      await this.boardingLocationsRepository.update(
        id,
        updateBoardingLocationDto,
      );
    if (!updatedBoardingLocation) {
      throw new NotFoundException('Local de embarque não encontrado');
    }

    return updatedBoardingLocation;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateBoardingLocationDto: UpdateBoardingLocationDto,
  ): Promise<BoardingLocation> {
    // Verificar se local de embarque existe na agência
    const existingBoardingLocation =
      await this.boardingLocationsRepository.findOneByAgency(id, agencyId);
    if (!existingBoardingLocation) {
      throw new NotFoundException(
        'Local de embarque não encontrado nesta agência',
      );
    }

    const updatedBoardingLocation =
      await this.boardingLocationsRepository.updateByAgency(
        id,
        agencyId,
        updateBoardingLocationDto,
      );
    if (!updatedBoardingLocation) {
      throw new NotFoundException(
        'Local de embarque não encontrado nesta agência',
      );
    }

    return updatedBoardingLocation;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.boardingLocationsRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Local de embarque não encontrado');
    }
  }

  async removeByAgency(id: string, agencyId: string): Promise<void> {
    const deleted = await this.boardingLocationsRepository.removeByAgency(
      id,
      agencyId,
    );
    if (!deleted) {
      throw new NotFoundException(
        'Local de embarque não encontrado nesta agência',
      );
    }
  }

  async countByAgency(agencyId: string): Promise<number> {
    return this.boardingLocationsRepository.countByAgency(agencyId);
  }
}
