import { PartialType } from '@nestjs/swagger';
import { CreateAgeRangeDto } from './create-age-range.dto';

export class UpdateAgeRangeDto extends PartialType(CreateAgeRangeDto) {}
