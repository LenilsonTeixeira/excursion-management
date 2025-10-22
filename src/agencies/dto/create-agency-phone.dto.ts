import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgencyPhoneDto {
  @ApiProperty({
    description: 'Tipo do telefone',
    example: 'main',
    enum: ['main', 'mobile', 'fax', 'whatsapp'],
  })
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsIn(['main', 'mobile', 'fax', 'whatsapp'], {
    message: 'Tipo deve ser: main, mobile, fax ou whatsapp',
  })
  type: string;

  @ApiProperty({
    description: 'Número do telefone (formato: (XX) XXXXX-XXXX)',
    example: '(11) 99999-9999',
    pattern: '^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$',
  })
  @IsString({ message: 'Número deve ser uma string' })
  @IsNotEmpty({ message: 'Número é obrigatório' })
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Número deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX',
  })
  number: string;
}

export class UpdateAgencyPhoneDto {
  @ApiPropertyOptional({
    description: 'Tipo do telefone',
    example: 'mobile',
    enum: ['main', 'mobile', 'fax', 'whatsapp'],
  })
  @IsOptional()
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(['main', 'mobile', 'fax', 'whatsapp'], {
    message: 'Tipo deve ser: main, mobile, fax ou whatsapp',
  })
  type?: string;

  @ApiPropertyOptional({
    description: 'Número do telefone (formato: (XX) XXXXX-XXXX)',
    example: '(21) 88888-8888',
    pattern: '^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$',
  })
  @IsOptional()
  @IsString({ message: 'Número deve ser uma string' })
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Número deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX',
  })
  number?: string;
}
