import { Injectable, NotFoundException } from '@nestjs/common';
import { TripImagesRepository, TripImage } from './trip-images.repository';
import { TripsRepository } from './trips.repository';
import { S3UploadService } from '../common/services/s3-upload.service';
import { UploadTripImageDto } from './dto/upload-trip-image.dto';
import { UpdateTripImageDto } from './dto/update-trip-image.dto';

@Injectable()
export class TripImagesService {
  constructor(
    private readonly tripImagesRepository: TripImagesRepository,
    private readonly tripsRepository: TripsRepository,
    private readonly s3UploadService: S3UploadService,
  ) {}

  async uploadImage(
    tripId: string,
    file: Buffer,
    uploadDto: UploadTripImageDto,
  ): Promise<TripImage> {
    // Verificar se trip existe
    const trip = await this.tripsRepository.findOne(tripId);
    if (!trip) {
      throw new NotFoundException('Viagem não encontrada');
    }

    // Upload para S3
    const { originalUrl, thumbnailUrl } =
      await this.s3UploadService.uploadImage(file, `trips/${tripId}`);

    // Se é imagem principal, desmarcar outras
    if (uploadDto.isMain) {
      await this.tripImagesRepository.unsetAllMainImages(tripId);
    }

    // Criar registro no banco
    const image = await this.tripImagesRepository.create(
      tripId,
      originalUrl,
      thumbnailUrl,
      uploadDto.displayOrder,
      uploadDto.isMain,
    );

    // Se é imagem principal, atualizar trip
    if (uploadDto.isMain) {
      await this.tripsRepository.updateMainImage(
        tripId,
        originalUrl,
        thumbnailUrl,
      );
    }

    return image;
  }

  async findAllByTrip(tripId: string): Promise<TripImage[]> {
    return this.tripImagesRepository.findAllByTrip(tripId);
  }

  async findOne(id: string): Promise<TripImage> {
    const image = await this.tripImagesRepository.findOne(id);
    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }
    return image;
  }

  async findOneByTrip(id: string, tripId: string): Promise<TripImage> {
    const image = await this.tripImagesRepository.findOneByTrip(id, tripId);
    if (!image) {
      throw new NotFoundException('Imagem não encontrada nesta viagem');
    }
    return image;
  }

  async updateImage(
    id: string,
    tripId: string,
    file: Buffer | null,
    updateDto: UpdateTripImageDto,
  ): Promise<TripImage> {
    // Verificar se imagem existe
    const existingImage = await this.tripImagesRepository.findOneByTrip(
      id,
      tripId,
    );
    if (!existingImage) {
      throw new NotFoundException('Imagem não encontrada nesta viagem');
    }

    let imageUrl = existingImage.imageUrl;
    let thumbnailUrl = existingImage.thumbnailUrl;

    // Se novo arquivo foi enviado, fazer upload e deletar antigo
    if (file) {
      // Deletar imagens antigas do S3
      await this.s3UploadService.deleteImages([
        existingImage.imageUrl,
        existingImage.thumbnailUrl,
      ]);

      // Upload novas imagens
      const uploadResult = await this.s3UploadService.uploadImage(
        file,
        `trips/${tripId}`,
      );
      imageUrl = uploadResult.originalUrl;
      thumbnailUrl = uploadResult.thumbnailUrl;
    }

    // Se mudou para imagem principal, desmarcar outras
    if (updateDto.isMain && !existingImage.isMain) {
      await this.tripImagesRepository.unsetAllMainImages(tripId);
    }

    // Atualizar registro
    const updatedImage = await this.tripImagesRepository.update(id, {
      imageUrl,
      thumbnailUrl,
      displayOrder: updateDto.displayOrder,
      isMain: updateDto.isMain,
    });

    if (!updatedImage) {
      throw new NotFoundException('Imagem não encontrada');
    }

    // Se é imagem principal, atualizar trip
    if (updateDto.isMain) {
      await this.tripsRepository.updateMainImage(
        tripId,
        imageUrl,
        thumbnailUrl,
      );
    }

    return updatedImage;
  }

  async remove(id: string, tripId: string): Promise<void> {
    // Verificar se imagem existe
    const image = await this.tripImagesRepository.findOneByTrip(id, tripId);
    if (!image) {
      throw new NotFoundException('Imagem não encontrada nesta viagem');
    }

    // Deletar do S3
    await this.s3UploadService.deleteImages([
      image.imageUrl,
      image.thumbnailUrl,
    ]);

    // Deletar do banco
    const deleted = await this.tripImagesRepository.removeByTrip(id, tripId);
    if (!deleted) {
      throw new NotFoundException('Imagem não encontrada nesta viagem');
    }

    // Se era a imagem principal, limpar referência na trip
    if (image.isMain) {
      await this.tripsRepository.updateMainImage(tripId, '', '');
    }
  }
}
