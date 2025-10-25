import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { TripImagesService } from './trip-images.service';
import { UploadTripImageDto } from './dto/upload-trip-image.dto';
import { UpdateTripImageDto } from './dto/update-trip-image.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AllowRoles } from '../common/decorators/allow-roles.decorator';
import { RequireOwnership } from '../common/decorators/require-ownership.decorator';

@ApiTags('trip-images')
@ApiBearerAuth()
@Controller('agencies/:agencyId/trips/:tripId/images')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripImagesController {
  constructor(private readonly tripImagesService: TripImagesService) {}

  @Post()
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload de imagem da viagem',
    description:
      'Faz upload de uma imagem para a viagem. A imagem é processada e armazenada no S3.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripId',
    description: 'ID da viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem',
        },
        data: {
          type: 'string',
          description: 'JSON com displayOrder, isMain e operationType',
          example:
            '{"displayOrder": 0, "isMain": true, "operationType": "ADD"}',
        },
      },
      required: ['file', 'data'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imagem enviada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou arquivo ausente',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Viagem não encontrada' })
  async uploadImage(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('data') data: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo de imagem é obrigatório');
    }

    let uploadDto: UploadTripImageDto;
    try {
      uploadDto = JSON.parse(data);
    } catch {
      throw new BadRequestException('Dados inválidos no campo data');
    }

    if (uploadDto.operationType !== 'ADD') {
      throw new BadRequestException(
        'operationType deve ser ADD para novo upload',
      );
    }

    return this.tripImagesService.uploadImage(tripId, file.buffer, uploadDto);
  }

  @Get()
  @AllowRoles('superadmin', 'agency_admin', 'agent')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Listar imagens da viagem',
    description: 'Lista todas as imagens de uma viagem específica.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripId',
    description: 'ID da viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de imagens retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findAll(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
  ) {
    return this.tripImagesService.findAllByTrip(tripId);
  }

  @Get(':imageId')
  @AllowRoles('superadmin', 'agency_admin', 'agent')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Detalhar imagem',
    description: 'Retorna os detalhes de uma imagem específica.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripId',
    description: 'ID da viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'imageId',
    description: 'ID da imagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da imagem retornados com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  async findOne(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.tripImagesService.findOneByTrip(imageId, tripId);
  }

  @Patch(':imageId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Atualizar imagem',
    description:
      'Atualiza uma imagem existente. Se um novo arquivo for enviado com operationType=UPDATE, a imagem antiga será deletada do S3 e substituída.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripId',
    description: 'ID da viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'imageId',
    description: 'ID da imagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (opcional)',
        },
        data: {
          type: 'string',
          description:
            'JSON com displayOrder, isMain e operationType (UPDATE se enviar file)',
          example:
            '{"displayOrder": 0, "isMain": true, "operationType": "UPDATE"}',
        },
      },
      required: ['data'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Imagem atualizada com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  async update(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('data') data: string,
  ) {
    let updateDto: UpdateTripImageDto & { operationType?: string };
    try {
      updateDto = JSON.parse(data);
    } catch {
      throw new BadRequestException('Dados inválidos no campo data');
    }

    if (file && updateDto.operationType !== 'UPDATE') {
      throw new BadRequestException(
        'operationType deve ser UPDATE quando enviar novo arquivo',
      );
    }

    return this.tripImagesService.updateImage(
      imageId,
      tripId,
      file ? file.buffer : null,
      updateDto,
    );
  }

  @Delete(':imageId')
  @AllowRoles('superadmin', 'agency_admin')
  @RequireOwnership()
  @ApiOperation({
    summary: 'Remover imagem',
    description: 'Remove uma imagem da viagem e do S3.',
  })
  @ApiParam({
    name: 'agencyId',
    description: 'ID da agência',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'tripId',
    description: 'ID da viagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'imageId',
    description: 'ID da imagem',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Imagem removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('agencyId', ParseUUIDPipe) agencyId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    await this.tripImagesService.remove(imageId, tripId);
  }
}
