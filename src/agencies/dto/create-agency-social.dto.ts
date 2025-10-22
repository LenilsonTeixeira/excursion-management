import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsIn,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgencySocialDto {
  @ApiProperty({
    description: 'Tipo de rede social',
    example: 'facebook',
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'],
  })
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsIn(['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'], {
    message:
      'Tipo deve ser: facebook, instagram, twitter, linkedin, youtube ou tiktok',
  })
  type: string;

  @ApiProperty({
    description: 'URL do perfil',
    example: 'https://facebook.com/agencia123',
    format: 'url',
  })
  @IsString({ message: 'URL deve ser uma string' })
  @IsNotEmpty({ message: 'URL é obrigatória' })
  @IsUrl({}, { message: 'URL deve ter um formato válido' })
  @Length(10, 200, { message: 'URL deve ter entre 10 e 200 caracteres' })
  url: string;
}

export class UpdateAgencySocialDto {
  @ApiPropertyOptional({
    description: 'Tipo de rede social',
    example: 'instagram',
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'],
  })
  @IsOptional()
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'], {
    message:
      'Tipo deve ser: facebook, instagram, twitter, linkedin, youtube ou tiktok',
  })
  type?: string;

  @ApiPropertyOptional({
    description: 'URL do perfil',
    example: 'https://instagram.com/agencia123',
    format: 'url',
  })
  @IsOptional()
  @IsString({ message: 'URL deve ser uma string' })
  @IsUrl({}, { message: 'URL deve ter um formato válido' })
  @Length(10, 200, { message: 'URL deve ter entre 10 e 200 caracteres' })
  url?: string;
}
