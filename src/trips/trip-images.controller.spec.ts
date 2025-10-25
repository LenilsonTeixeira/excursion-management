import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TripImagesController } from './trip-images.controller';
import { TripImagesService } from './trip-images.service';

describe('TripImagesController', () => {
  let controller: TripImagesController;
  let service: jest.Mocked<TripImagesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripImagesController],
      providers: [
        {
          provide: TripImagesService,
          useValue: {
            uploadImage: jest.fn(),
            findAllByTrip: jest.fn(),
            findOneByTrip: jest.fn(),
            updateImage: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TripImagesController>(TripImagesController);
    service = module.get(TripImagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload an image', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const file = {
        buffer: Buffer.from('test'),
      } as Express.Multer.File;
      const data = JSON.stringify({
        displayOrder: 0,
        isMain: true,
        operationType: 'ADD',
      });

      const uploadedImage = {
        id: 'image-1',
        tripId,
        imageUrl: 'url',
        thumbnailUrl: 'thumb',
        isMain: true,
        displayOrder: 0,
      };

      service.uploadImage.mockResolvedValue(uploadedImage as any);

      const result = await controller.uploadImage(agencyId, tripId, file, data);

      expect(service.uploadImage).toHaveBeenCalledWith(
        tripId,
        file.buffer,
        expect.objectContaining({
          displayOrder: 0,
          isMain: true,
          operationType: 'ADD',
        }),
      );
      expect(result).toEqual(uploadedImage);
    });

    it('should throw BadRequestException if file is missing', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const data = JSON.stringify({
        displayOrder: 0,
        isMain: true,
        operationType: 'ADD',
      });

      await expect(
        controller.uploadImage(agencyId, tripId, undefined as any, data),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.uploadImage(agencyId, tripId, undefined as any, data),
      ).rejects.toThrow('Arquivo de imagem é obrigatório');
    });

    it('should throw BadRequestException if data is invalid JSON', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const file = {
        buffer: Buffer.from('test'),
      } as Express.Multer.File;
      const data = 'invalid-json';

      await expect(
        controller.uploadImage(agencyId, tripId, file, data),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.uploadImage(agencyId, tripId, file, data),
      ).rejects.toThrow('Dados inválidos no campo data');
    });

    it('should throw BadRequestException if operationType is not ADD', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const file = {
        buffer: Buffer.from('test'),
      } as Express.Multer.File;
      const data = JSON.stringify({
        displayOrder: 0,
        isMain: true,
        operationType: 'UPDATE',
      });

      await expect(
        controller.uploadImage(agencyId, tripId, file, data),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.uploadImage(agencyId, tripId, file, data),
      ).rejects.toThrow('operationType deve ser ADD para novo upload');
    });
  });

  describe('findAll', () => {
    it('should return all images for a trip', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const images = [
        { id: 'image-1', tripId, imageUrl: 'url1' },
        { id: 'image-2', tripId, imageUrl: 'url2' },
      ];

      service.findAllByTrip.mockResolvedValue(images as any);

      const result = await controller.findAll(agencyId, tripId);

      expect(service.findAllByTrip).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(images);
    });
  });

  describe('findOne', () => {
    it('should return a single image', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const imageId = 'image-1';
      const image = { id: imageId, tripId, imageUrl: 'url' };

      service.findOneByTrip.mockResolvedValue(image as any);

      const result = await controller.findOne(agencyId, tripId, imageId);

      expect(service.findOneByTrip).toHaveBeenCalledWith(imageId, tripId);
      expect(result).toEqual(image);
    });
  });

  describe('update', () => {
    it('should update image metadata without file', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const imageId = 'image-1';
      const data = JSON.stringify({
        displayOrder: 1,
        isMain: true,
      });

      const updatedImage = {
        id: imageId,
        tripId,
        displayOrder: 1,
        isMain: true,
      };

      service.updateImage.mockResolvedValue(updatedImage as any);

      const result = await controller.update(
        agencyId,
        tripId,
        imageId,
        undefined as any,
        data,
      );

      expect(service.updateImage).toHaveBeenCalledWith(
        imageId,
        tripId,
        null,
        expect.objectContaining({
          displayOrder: 1,
          isMain: true,
        }),
      );
      expect(result).toEqual(updatedImage);
    });

    it('should update image with new file', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const imageId = 'image-1';
      const file = {
        buffer: Buffer.from('new-image'),
      } as Express.Multer.File;
      const data = JSON.stringify({
        displayOrder: 1,
        isMain: true,
        operationType: 'UPDATE',
      });

      const updatedImage = {
        id: imageId,
        tripId,
        imageUrl: 'new-url',
      };

      service.updateImage.mockResolvedValue(updatedImage as any);

      const result = await controller.update(
        agencyId,
        tripId,
        imageId,
        file,
        data,
      );

      expect(service.updateImage).toHaveBeenCalledWith(
        imageId,
        tripId,
        file.buffer,
        expect.objectContaining({
          displayOrder: 1,
          isMain: true,
          operationType: 'UPDATE',
        }),
      );
      expect(result).toEqual(updatedImage);
    });

    it('should throw BadRequestException if file sent without operationType UPDATE', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const imageId = 'image-1';
      const file = {
        buffer: Buffer.from('new-image'),
      } as Express.Multer.File;
      const data = JSON.stringify({
        displayOrder: 1,
        isMain: true,
      });

      await expect(
        controller.update(agencyId, tripId, imageId, file, data),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.update(agencyId, tripId, imageId, file, data),
      ).rejects.toThrow(
        'operationType deve ser UPDATE quando enviar novo arquivo',
      );
    });
  });

  describe('remove', () => {
    it('should remove an image', async () => {
      const agencyId = 'agency-1';
      const tripId = 'trip-1';
      const imageId = 'image-1';

      service.remove.mockResolvedValue(undefined);

      await controller.remove(agencyId, tripId, imageId);

      expect(service.remove).toHaveBeenCalledWith(imageId, tripId);
    });
  });
});
