import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTripAgePriceGroupDto {
  @ApiProperty({
    description: 'ID da faixa etária',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  ageRangeId: string;

  @ApiProperty({
    description: 'Preço final de venda',
    example: 199.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  finalPrice: number;

  @ApiProperty({
    description: 'Preço original (opcional, para mostrar desconto)',
    example: 250.0,
    minimum: 0,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  originalPrice?: number;

  @ApiProperty({
    description: 'Ordem de exibição na vitrine',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  displayOrder: number;

  @ApiProperty({
    description: 'Descrição adicional do preço (opcional)',
    example: 'Válido para crianças de 0 a 5 anos',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Define se o grupo de preço está ativo',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
