import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Minha Empresa', description: 'Nome do tenant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'minha-empresa',
    description: 'Slug único do tenant',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: 'free',
    description: 'Plano do tenant',
    default: 'free',
    required: false,
  })
  @IsString()
  @IsOptional()
  plan?: string;
}
