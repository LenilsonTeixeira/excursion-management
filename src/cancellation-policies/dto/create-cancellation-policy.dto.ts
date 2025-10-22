import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CancellationPolicyRuleDto } from './cancellation-policy-rule.dto';

export class CreateCancellationPolicyDto {
  @ApiProperty({
    description: 'Nome da política de cancelamento',
    example: 'Política Flexível',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Descrição da política de cancelamento',
    example: 'Reembolso de até 80% se cancelado com antecedência.',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Define se é a política padrão da agência',
    example: false,
    default: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  isDefault: boolean;

  @ApiProperty({
    description: 'Regras da política de cancelamento',
    type: [CancellationPolicyRuleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CancellationPolicyRuleDto)
  rules: CancellationPolicyRuleDto[];
}
