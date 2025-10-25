import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsDateString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTripDto {
  @ApiProperty({
    description: 'Slug único da viagem dentro da agência',
    example: 'bora-de-excursao-ilha-grande-20-09-2023',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  slug: string;

  @ApiProperty({
    description: 'Destino da viagem',
    example: 'Ilha Grande - RJ',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  destination: string;

  @ApiProperty({
    description: 'Descrição da viagem',
    example: 'Uma experiência incrível na paradisíaca Ilha Grande...',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'URL do vídeo promocional',
    example: 'https://youtube.com/watch?v=example',
    required: false,
  })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({
    description: 'Data de partida da viagem',
    example: '2023-09-20T08:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  departureDate: string;

  @ApiProperty({
    description: 'Data de retorno da viagem',
    example: '2023-09-22T20:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  returnDate: string;

  @ApiProperty({
    description: 'Preço exibido no card (a partir de)',
    example: 599.99,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  displayPrice?: number;

  @ApiProperty({
    description: 'Label do preço exibido',
    example: 'A partir de',
    required: false,
  })
  @IsString()
  @IsOptional()
  displayLabel?: string;

  @ApiProperty({
    description: 'Total de vagas disponíveis',
    example: 50,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  totalSeats: number;

  @ApiProperty({
    description: 'Limite de vagas para alerta de "Poucas vagas"',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  alertLowStockThreshold?: number;

  @ApiProperty({
    description: 'Limite de vagas para alerta de "Últimas vagas"',
    example: 5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  alertLastSeatsThreshold?: number;

  @ApiProperty({
    description: 'Status da viagem',
    example: 'ACTIVE',
    enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'FINISHED', 'CANCELLED'],
    default: 'ACTIVE',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE', 'INACTIVE', 'FINISHED', 'CANCELLED'])
  status?: string;

  @ApiProperty({
    description: 'Permite seleção de assento',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  allowSeatSelection?: boolean;

  @ApiProperty({
    description: 'Aceita lista de espera',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  acceptsWaitingList?: boolean;

  @ApiProperty({
    description: 'ID da política de cancelamento',
    example: 'uuid',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  cancellationPolicyId?: string;

  @ApiProperty({
    description: 'ID da categoria da viagem',
    example: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
