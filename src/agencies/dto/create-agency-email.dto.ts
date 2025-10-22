import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsIn,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgencyEmailDto {
  @ApiProperty({
    description: 'Endereço de email',
    example: 'contato@agencia.com',
    format: 'email',
  })
  @IsString({ message: 'Email deve ser uma string' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Length(5, 100, { message: 'Email deve ter entre 5 e 100 caracteres' })
  email: string;
}

export class UpdateAgencyEmailDto {
  @ApiPropertyOptional({
    description: 'Endereço de email',
    example: 'vendas@agencia.com',
    format: 'email',
  })
  @IsOptional()
  @IsString({ message: 'Email deve ser uma string' })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Length(5, 100, { message: 'Email deve ter entre 5 e 100 caracteres' })
  email?: string;
}
