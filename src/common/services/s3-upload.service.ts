import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import { randomUUID } from 'crypto';

export interface UploadResult {
  originalUrl: string;
  thumbnailUrl: string;
}

@Injectable()
export class S3UploadService {
  private readonly logger = new Logger(S3UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>(
      'AWS_S3_BUCKET',
      'excursion-management-ag-bora-de-excursao',
    );
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');

    const s3Config: any = {
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>(
          'AWS_ACCESS_KEY_ID',
          'test',
        ),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          'test',
        ),
      },
    };

    // Se endpoint está configurado (LocalStack), adicionar configurações específicas
    if (this.endpoint) {
      s3Config.endpoint = this.endpoint;
      s3Config.forcePathStyle = true; // Necessário para LocalStack
    }

    this.s3Client = new S3Client(s3Config);

    this.logger.log(
      `S3UploadService initialized with bucket: ${this.bucket}, region: ${this.region}${this.endpoint ? `, endpoint: ${this.endpoint}` : ''}`,
    );
  }

  /**
   * Faz upload de uma imagem para o S3
   * Processa a imagem gerando uma versão original (1200px) e um thumbnail (400px)
   * @param file Buffer da imagem
   * @param folder Pasta no S3 onde a imagem será armazenada
   * @returns URLs da imagem original e thumbnail
   */
  async uploadImage(
    file: Buffer,
    folder: string = 'trips',
  ): Promise<UploadResult> {
    const fileId = randomUUID();
    const timestamp = Date.now();

    try {
      // Processar imagem original (max 1200px)
      const originalImage = await sharp(file)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Processar thumbnail (max 400px)
      const thumbnailImage = await sharp(file)
        .resize(400, 400, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const originalKey = `${folder}/${timestamp}-${fileId}-original.jpg`;
      const thumbnailKey = `${folder}/${timestamp}-${fileId}-thumbnail.jpg`;

      // Upload paralelo para S3
      await Promise.all([
        this.uploadToS3(originalKey, originalImage, 'image/jpeg'),
        this.uploadToS3(thumbnailKey, thumbnailImage, 'image/jpeg'),
      ]);

      const originalUrl = this.getPublicUrl(originalKey);
      const thumbnailUrl = this.getPublicUrl(thumbnailKey);

      this.logger.log(
        `Image uploaded successfully: ${originalKey}, ${thumbnailKey}`,
      );

      return {
        originalUrl,
        thumbnailUrl,
      };
    } catch (error) {
      this.logger.error('Error uploading image to S3', error);
      throw error;
    }
  }

  /**
   * Remove uma imagem do S3 a partir da URL
   * @param url URL da imagem a ser removida
   */
  async deleteImage(url: string): Promise<void> {
    try {
      const key = this.extractKeyFromUrl(url);
      if (!key) {
        this.logger.warn(`Invalid URL format, cannot extract key: ${url}`);
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Image deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting image from S3: ${url}`, error);
      throw error;
    }
  }

  /**
   * Remove múltiplas imagens do S3
   * @param urls Array de URLs das imagens a serem removidas
   */
  async deleteImages(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.deleteImage(url)));
  }

  /**
   * Faz upload de um arquivo para o S3
   * @param key Chave (caminho) do arquivo no S3
   * @param body Conteúdo do arquivo
   * @param contentType Tipo MIME do arquivo
   */
  private async uploadToS3(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
  }

  /**
   * Gera a URL pública de um objeto no S3
   * @param key Chave do objeto no S3
   * @returns URL pública
   */
  private getPublicUrl(key: string): string {
    if (this.endpoint) {
      // LocalStack
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
    // AWS S3
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Extrai a chave (key) de uma URL do S3
   * @param url URL completa do S3
   * @returns Chave do objeto ou null se inválido
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      if (this.endpoint && url.startsWith(this.endpoint)) {
        // LocalStack: http://localhost:4566/bucket/path/to/file.jpg
        const parts = url.replace(`${this.endpoint}/${this.bucket}/`, '');
        return parts;
      }
      // AWS S3: https://bucket.s3.region.amazonaws.com/path/to/file.jpg
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading /
    } catch (error) {
      this.logger.error(`Error extracting key from URL: ${url}`, error);
      return null;
    }
  }
}
