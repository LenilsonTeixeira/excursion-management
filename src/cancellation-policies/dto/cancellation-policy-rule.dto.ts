import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CancellationPolicyRuleDto {
  @ApiProperty({
    description: 'Número de dias antes da viagem',
    example: 15,
    minimum: 0,
    maximum: 365,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(365)
  @Type(() => Number)
  daysBeforeTrip: number;

  @ApiProperty({
    description: 'Percentual de reembolso (0.0 a 1.0)',
    example: 0.8,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  refundPercentage: number;

  @ApiProperty({
    description: 'Ordem de exibição da regra',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  displayOrder: number;
}

export class CancellationPolicyRuleResponseDto {
  @ApiProperty({
    description: 'ID da regra',
    example: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Número de dias antes da viagem',
    example: 15,
  })
  daysBeforeTrip: number;

  @ApiProperty({
    description: 'Percentual de reembolso',
    example: 0.8,
  })
  refundPercentage: number;

  @ApiProperty({
    description: 'Ordem de exibição da regra',
    example: 1,
  })
  displayOrder: number;
}
