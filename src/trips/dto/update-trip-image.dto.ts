import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTripImageDto {
  @ApiProperty({
    description: 'Ordem de exibição da imagem',
    example: 1,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  displayOrder?: number;

  @ApiProperty({
    description: 'Definir como imagem principal',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isMain?: boolean;
}
