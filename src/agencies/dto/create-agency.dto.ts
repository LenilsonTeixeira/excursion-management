import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgencyDto {
  @ApiProperty({
    description: 'Nome da agência',
    example: 'Agência de Viagens ABC',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'CADASTUR da agência (formato: XX.XXXXX.XX/XXXX-XX)',
    example: '12.34567.89/0001-12',
    pattern: '^\\d{2}\\.\\d{5}\\.\\d{2}/\\d{4}-\\d{2}$',
  })
  @IsString({ message: 'CADASTUR deve ser uma string' })
  @IsNotEmpty({ message: 'CADASTUR é obrigatório' })
  @Matches(/^\d{2}\.\d{5}\.\d{2}\/\d{4}-\d{2}$/, {
    message: 'CADASTUR deve estar no formato XX.XXXXX.XX/XXXX-XX',
  })
  cadastur: string;

  @ApiProperty({
    description: 'CNPJ da agência (formato: XX.XXX.XXX/XXXX-XX)',
    example: '12.345.678/0001-90',
    pattern: '^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$',
  })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX',
  })
  cnpj: string;

  @ApiPropertyOptional({
    description: 'Descrição da agência',
    example: 'Agência especializada em turismo nacional e internacional',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @Length(0, 500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  description?: string;
}
