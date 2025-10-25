import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TripImagesService } from './trip-images.service';
import { TripImagesRepository } from './trip-images.repository';
import { TripsRepository } from './trips.repository';
import { S3UploadService } from '../common/services/s3-upload.service';
import { UploadTripImageDto } from './dto/upload-trip-image.dto';
import { UpdateTripImageDto } from './dto/update-trip-image.dto';

describe('TripImagesService', () => {
  let service: TripImagesService;
  let tripImagesRepository: jest.Mocked<TripImagesRepository>;
  let tripsRepository: jest.Mocked<TripsRepository>;
  let s3UploadService: jest.Mocked<S3UploadService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripImagesService,
        {
          provide: TripImagesRepository,
          useValue: {
            create: jest.fn(),
            findAllByTrip: jest.fn(),
            findOne: jest.fn(),
            findOneByTrip: jest.fn(),
            update: jest.fn(),
            unsetAllMainImages: jest.fn(),
            removeByTrip: jest.fn(),
          },
        },
        {
          provide: TripsRepository,
          useValue: {
            findOne: jest.fn(),
            updateMainImage: jest.fn(),
          },
        },
        {
          provide: S3UploadService,
          useValue: {
            uploadImage: jest.fn(),
            deleteImages: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TripImagesService>(TripImagesService);
    tripImagesRepository = module.get(TripImagesRepository);
    tripsRepository = module.get(TripsRepository);
    s3UploadService = module.get(S3UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload image and create record', async () => {
      const tripId = 'trip-1';
      const fileBuffer = Buffer.from('fake-image');
      const uploadDto: UploadTripImageDto = {
        displayOrder: 0,
        isMain: false,
        operationType: 'ADD',
      };

      const trip = { id: tripId, destination: 'Test' };
      const uploadResult = {
        originalUrl: 'https://s3.amazonaws.com/image.jpg',
        thumbnailUrl: 'https://s3.amazonaws.com/thumbnail.jpg',
      };
      const createdImage = {
        id: 'image-1',
        tripId,
        imageUrl: uploadResult.originalUrl,
        thumbnailUrl: uploadResult.thumbnailUrl,
        isMain: false,
        displayOrder: 0,
      };

      tripsRepository.findOne.mockResolvedValue(trip as any);
      s3UploadService.uploadImage.mockResolvedValue(uploadResult);
      tripImagesRepository.create.mockResolvedValue(createdImage as any);

      const result = await service.uploadImage(tripId, fileBuffer, uploadDto);

      expect(tripsRepository.findOne).toHaveBeenCalledWith(tripId);
      expect(s3UploadService.uploadImage).toHaveBeenCalledWith(
        fileBuffer,
        `trips/${tripId}`,
      );
      expect(tripImagesRepository.create).toHaveBeenCalledWith(
        tripId,
        uploadResult.originalUrl,
        uploadResult.thumbnailUrl,
        uploadDto.displayOrder,
        uploadDto.isMain,
      );
      expect(result).toEqual(createdImage);
    });

    it('should throw NotFoundException if trip not found', async () => {
      const tripId = 'non-existent';
      const fileBuffer = Buffer.from('fake-image');
      const uploadDto: UploadTripImageDto = {
        displayOrder: 0,
        isMain: false,
        operationType: 'ADD',
      };

      tripsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.uploadImage(tripId, fileBuffer, uploadDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.uploadImage(tripId, fileBuffer, uploadDto),
      ).rejects.toThrow('Viagem não encontrada');
    });

    it('should update trip mainImage when isMain is true', async () => {
      const tripId = 'trip-1';
      const fileBuffer = Buffer.from('fake-image');
      const uploadDto: UploadTripImageDto = {
        displayOrder: 0,
        isMain: true,
        operationType: 'ADD',
      };

      const trip = { id: tripId };
      const uploadResult = {
        originalUrl: 'https://s3.amazonaws.com/image.jpg',
        thumbnailUrl: 'https://s3.amazonaws.com/thumbnail.jpg',
      };
      const createdImage = {
        id: 'image-1',
        tripId,
        imageUrl: uploadResult.originalUrl,
        thumbnailUrl: uploadResult.thumbnailUrl,
        isMain: true,
        displayOrder: 0,
      };

      tripsRepository.findOne.mockResolvedValue(trip as any);
      s3UploadService.uploadImage.mockResolvedValue(uploadResult);
      tripImagesRepository.create.mockResolvedValue(createdImage as any);
      tripImagesRepository.unsetAllMainImages.mockResolvedValue(undefined);
      tripsRepository.updateMainImage.mockResolvedValue(undefined);

      await service.uploadImage(tripId, fileBuffer, uploadDto);

      expect(tripImagesRepository.unsetAllMainImages).toHaveBeenCalledWith(
        tripId,
      );
      expect(tripsRepository.updateMainImage).toHaveBeenCalledWith(
        tripId,
        uploadResult.originalUrl,
        uploadResult.thumbnailUrl,
      );
    });
  });

  describe('findAllByTrip', () => {
    it('should return all images for a trip', async () => {
      const tripId = 'trip-1';
      const images = [
        { id: 'image-1', tripId, imageUrl: 'url1', displayOrder: 0 },
        { id: 'image-2', tripId, imageUrl: 'url2', displayOrder: 1 },
      ];

      tripImagesRepository.findAllByTrip.mockResolvedValue(images as any);

      const result = await service.findAllByTrip(tripId);

      expect(tripImagesRepository.findAllByTrip).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(images);
    });
  });

  describe('findOneByTrip', () => {
    it('should return an image', async () => {
      const imageId = 'image-1';
      const tripId = 'trip-1';
      const image = { id: imageId, tripId, imageUrl: 'url' };

      tripImagesRepository.findOneByTrip.mockResolvedValue(image as any);

      const result = await service.findOneByTrip(imageId, tripId);

      expect(tripImagesRepository.findOneByTrip).toHaveBeenCalledWith(
        imageId,
        tripId,
      );
      expect(result).toEqual(image);
    });

    it('should throw NotFoundException if image not found', async () => {
      const imageId = 'non-existent';
      const tripId = 'trip-1';

      tripImagesRepository.findOneByTrip.mockResolvedValue(null);

      await expect(service.findOneByTrip(imageId, tripId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOneByTrip(imageId, tripId)).rejects.toThrow(
        'Imagem não encontrada nesta viagem',
      );
    });
  });

  describe('updateImage', () => {
    it('should update image metadata without file', async () => {
      const imageId = 'image-1';
      const tripId = 'trip-1';
      const updateDto: UpdateTripImageDto = {
        displayOrder: 1,
        isMain: false,
      };

      const existingImage = {
        id: imageId,
        tripId,
        imageUrl: 'url',
        thumbnailUrl: 'thumb',
        isMain: false,
        displayOrder: 0,
      };

      const updatedImage = {
        ...existingImage,
        ...updateDto,
      };

      tripImagesRepository.findOneByTrip.mockResolvedValue(
        existingImage as any,
      );
      tripImagesRepository.update.mockResolvedValue(updatedImage as any);

      const result = await service.updateImage(
        imageId,
        tripId,
        null,
        updateDto,
      );

      expect(tripImagesRepository.update).toHaveBeenCalledWith(imageId, {
        imageUrl: existingImage.imageUrl,
        thumbnailUrl: existingImage.thumbnailUrl,
        displayOrder: updateDto.displayOrder,
        isMain: updateDto.isMain,
      });
      expect(result).toEqual(updatedImage);
    });

    it('should update image with new file', async () => {
      const imageId = 'image-1';
      const tripId = 'trip-1';
      const fileBuffer = Buffer.from('new-image');
      const updateDto: UpdateTripImageDto = {
        displayOrder: 1,
        isMain: false,
      };

      const existingImage = {
        id: imageId,
        tripId,
        imageUrl: 'old-url',
        thumbnailUrl: 'old-thumb',
        isMain: false,
        displayOrder: 0,
      };

      const uploadResult = {
        originalUrl: 'new-url',
        thumbnailUrl: 'new-thumb',
      };

      const updatedImage = {
        ...existingImage,
        imageUrl: uploadResult.originalUrl,
        thumbnailUrl: uploadResult.thumbnailUrl,
        ...updateDto,
      };

      tripImagesRepository.findOneByTrip.mockResolvedValue(
        existingImage as any,
      );
      s3UploadService.deleteImages.mockResolvedValue(undefined);
      s3UploadService.uploadImage.mockResolvedValue(uploadResult);
      tripImagesRepository.update.mockResolvedValue(updatedImage as any);

      const result = await service.updateImage(
        imageId,
        tripId,
        fileBuffer,
        updateDto,
      );

      expect(s3UploadService.deleteImages).toHaveBeenCalledWith([
        existingImage.imageUrl,
        existingImage.thumbnailUrl,
      ]);
      expect(s3UploadService.uploadImage).toHaveBeenCalledWith(
        fileBuffer,
        `trips/${tripId}`,
      );
      expect(result).toEqual(updatedImage);
    });
  });

  describe('remove', () => {
    it('should remove image from S3 and database', async () => {
      const imageId = 'image-1';
      const tripId = 'trip-1';
      const image = {
        id: imageId,
        tripId,
        imageUrl: 'url',
        thumbnailUrl: 'thumb',
        isMain: false,
      };

      tripImagesRepository.findOneByTrip.mockResolvedValue(image as any);
      s3UploadService.deleteImages.mockResolvedValue(undefined);
      tripImagesRepository.removeByTrip.mockResolvedValue(true);

      await service.remove(imageId, tripId);

      expect(s3UploadService.deleteImages).toHaveBeenCalledWith([
        image.imageUrl,
        image.thumbnailUrl,
      ]);
      expect(tripImagesRepository.removeByTrip).toHaveBeenCalledWith(
        imageId,
        tripId,
      );
    });

    it('should clear trip mainImage if removing main image', async () => {
      const imageId = 'image-1';
      const tripId = 'trip-1';
      const image = {
        id: imageId,
        tripId,
        imageUrl: 'url',
        thumbnailUrl: 'thumb',
        isMain: true,
      };

      tripImagesRepository.findOneByTrip.mockResolvedValue(image as any);
      s3UploadService.deleteImages.mockResolvedValue(undefined);
      tripImagesRepository.removeByTrip.mockResolvedValue(true);
      tripsRepository.updateMainImage.mockResolvedValue(undefined);

      await service.remove(imageId, tripId);

      expect(tripsRepository.updateMainImage).toHaveBeenCalledWith(
        tripId,
        '',
        '',
      );
    });

    it('should throw NotFoundException if image not found', async () => {
      const imageId = 'non-existent';
      const tripId = 'trip-1';

      tripImagesRepository.findOneByTrip.mockResolvedValue(null);

      await expect(service.remove(imageId, tripId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
