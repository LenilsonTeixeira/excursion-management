import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAgeRangeDto {
  @ApiProperty({
    description: 'Nome da faixa etária',
    example: 'Adulto',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Idade mínima da faixa etária',
    example: 18,
    minimum: 0,
    maximum: 120,
  })
  @IsNumber()
  @Min(0)
  @Max(120)
  @Type(() => Number)
  minAge: number;

  @ApiProperty({
    description: 'Idade máxima da faixa etária',
    example: 65,
    minimum: 0,
    maximum: 120,
  })
  @IsNumber()
  @Min(0)
  @Max(120)
  @Type(() => Number)
  maxAge: number;

  @ApiProperty({
    description: 'Se a faixa etária ocupa assento',
    example: true,
    default: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  occupiesSeat: boolean;
}
