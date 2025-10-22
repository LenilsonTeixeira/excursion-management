import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupAgencyDto {
  @ApiProperty({ example: 'Agência Viagens Brasil' })
  @IsNotEmpty({ message: 'Nome da agência é obrigatório' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin@agenciaviagens.com' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  emailAdmin: string;

  @ApiProperty({ example: 'Senha@123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
    {
      message:
        'Senha deve conter letra maiúscula, minúscula, número e caractere especial',
    },
  )
  password: string;

  @ApiProperty({ example: 'João Silva', required: false })
  @IsOptional()
  @IsString()
  adminName?: string;

  @ApiProperty({
    example: false,
    description: 'Se true, cria convite ao invés de criar diretamente',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  useInviteFlow?: boolean;
}
