import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardingLocationDto {
  @ApiProperty({
    description: 'Nome do local de embarque',
    example: 'Terminal Rodoviário Central',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição do local de embarque',
    example: 'Terminal principal com estacionamento e lanchonete',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @Length(0, 200, { message: 'Descrição deve ter no máximo 200 caracteres' })
  description?: string;

  @ApiProperty({
    description: 'Cidade do local de embarque',
    example: 'São Paulo',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Cidade deve ser uma string' })
  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  @Length(2, 100, { message: 'Cidade deve ter entre 2 e 100 caracteres' })
  city: string;
}
