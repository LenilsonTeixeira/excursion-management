import { ApiProperty } from '@nestjs/swagger';
import { CancellationPolicyRuleResponseDto } from './cancellation-policy-rule.dto';

export class CancellationPolicyResponseDto {
  @ApiProperty({
    description: 'ID da política de cancelamento',
    example: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da política de cancelamento',
    example: 'Política Flexível',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição da política de cancelamento',
    example: 'Reembolso de até 80% se cancelado com antecedência.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Define se é a política padrão da agência',
    example: false,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'ID da agência',
    example: 'uuid',
  })
  agencyId: string;

  @ApiProperty({
    description: 'Regras da política de cancelamento',
    type: [CancellationPolicyRuleResponseDto],
  })
  rules: CancellationPolicyRuleResponseDto[];

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
