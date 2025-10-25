import { PartialType } from '@nestjs/swagger';
import { CreateTripAgePriceGroupDto } from './create-trip-age-price-group.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateTripAgePriceGroupDto extends PartialType(
  OmitType(CreateTripAgePriceGroupDto, ['ageRangeId'] as const),
) {}
