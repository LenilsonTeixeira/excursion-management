import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAgencyAddressDto {
  @ApiProperty({
    description: 'Tipo do endereço',
    example: 'main',
    enum: ['main', 'branch', 'warehouse'],
  })
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsIn(['main', 'branch', 'warehouse'], {
    message: 'Tipo deve ser: main, branch ou warehouse',
  })
  type: string;

  @ApiProperty({
    description: 'Endereço completo',
    example: 'Rua das Flores',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Endereço deve ser uma string' })
  @IsNotEmpty({ message: 'Endereço é obrigatório' })
  @Length(2, 100, { message: 'Endereço deve ter entre 2 e 100 caracteres' })
  address: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
    minLength: 1,
    maxLength: 10,
  })
  @IsString({ message: 'Número deve ser uma string' })
  @IsNotEmpty({ message: 'Número é obrigatório' })
  @Length(1, 10, { message: 'Número deve ter entre 1 e 10 caracteres' })
  number: string;

  @ApiPropertyOptional({
    description: 'Complemento do endereço',
    example: 'Apto 45',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Complemento deve ser uma string' })
  @Length(0, 50, { message: 'Complemento deve ter no máximo 50 caracteres' })
  complement?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Bairro deve ser uma string' })
  @IsNotEmpty({ message: 'Bairro é obrigatório' })
  @Length(2, 50, { message: 'Bairro deve ter entre 2 e 50 caracteres' })
  neighborhood: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Cidade deve ser uma string' })
  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  @Length(2, 50, { message: 'Cidade deve ter entre 2 e 50 caracteres' })
  city: string;

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'SP',
    minLength: 2,
    maxLength: 2,
  })
  @IsString({ message: 'Estado deve ser uma string' })
  @IsNotEmpty({ message: 'Estado é obrigatório' })
  @Length(2, 2, { message: 'Estado deve ter exatamente 2 caracteres' })
  @Transform(({ value }) => value?.toUpperCase())
  state: string;

  @ApiProperty({
    description: 'CEP (formato: XXXXX-XXX)',
    example: '01234-567',
    pattern: '^\\d{5}-\\d{3}$',
  })
  @IsString({ message: 'CEP deve ser uma string' })
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  @Length(9, 9, { message: 'CEP deve ter exatamente 9 caracteres' })
  zipCode: string;
}

export class UpdateAgencyAddressDto {
  @ApiPropertyOptional({
    description: 'Tipo do endereço',
    example: 'branch',
    enum: ['main', 'branch', 'warehouse'],
  })
  @IsOptional()
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(['main', 'branch', 'warehouse'], {
    message: 'Tipo deve ser: main, branch ou warehouse',
  })
  type?: string;

  @ApiPropertyOptional({
    description: 'Endereço completo',
    example: 'Avenida Paulista',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  @Length(2, 100, { message: 'Endereço deve ter entre 2 e 100 caracteres' })
  address?: string;

  @ApiPropertyOptional({
    description: 'Número do endereço',
    example: '456',
    minLength: 1,
    maxLength: 10,
  })
  @IsOptional()
  @IsString({ message: 'Número deve ser uma string' })
  @Length(1, 10, { message: 'Número deve ter entre 1 e 10 caracteres' })
  number?: string;

  @ApiPropertyOptional({
    description: 'Complemento do endereço',
    example: 'Sala 201',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Complemento deve ser uma string' })
  @Length(0, 50, { message: 'Complemento deve ter no máximo 50 caracteres' })
  complement?: string;

  @ApiPropertyOptional({
    description: 'Bairro',
    example: 'Bela Vista',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Bairro deve ser uma string' })
  @Length(2, 50, { message: 'Bairro deve ter entre 2 e 50 caracteres' })
  neighborhood?: string;

  @ApiPropertyOptional({
    description: 'Cidade',
    example: 'São Paulo',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Cidade deve ser uma string' })
  @Length(2, 50, { message: 'Cidade deve ter entre 2 e 50 caracteres' })
  city?: string;

  @ApiPropertyOptional({
    description: 'Estado (UF)',
    example: 'RJ',
    minLength: 2,
    maxLength: 2,
  })
  @IsOptional()
  @IsString({ message: 'Estado deve ser uma string' })
  @Length(2, 2, { message: 'Estado deve ter exatamente 2 caracteres' })
  @Transform(({ value }) => value?.toUpperCase())
  state?: string;

  @ApiPropertyOptional({
    description: 'CEP (formato: XXXXX-XXX)',
    example: '20000-000',
    pattern: '^\\d{5}-\\d{3}$',
  })
  @IsOptional()
  @IsString({ message: 'CEP deve ser uma string' })
  @Length(9, 9, { message: 'CEP deve ter exatamente 9 caracteres' })
  zipCode?: string;
}
