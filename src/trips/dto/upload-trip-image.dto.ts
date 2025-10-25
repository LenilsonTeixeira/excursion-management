import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsNotEmpty, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadTripImageDto {
  @ApiProperty({
    description: 'Ordem de exibição da imagem',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  displayOrder: number;

  @ApiProperty({
    description: 'Definir como imagem principal',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  isMain: boolean;

  @ApiProperty({
    description: 'Tipo de operação',
    example: 'ADD',
    enum: ['ADD', 'UPDATE'],
  })
  @IsIn(['ADD', 'UPDATE'])
  @IsNotEmpty()
  operationType: string;
}
