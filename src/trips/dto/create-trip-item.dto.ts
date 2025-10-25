import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTripItemDto {
  @ApiProperty({
    description: 'Nome do item',
    example: 'Seguro viagem',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Item está incluído no pacote?',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  isIncluded: boolean;
}
