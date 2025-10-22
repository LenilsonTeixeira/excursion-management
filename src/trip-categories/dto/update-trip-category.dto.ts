import { PartialType } from '@nestjs/swagger';
import { CreateTripCategoryDto } from './create-trip-category.dto';

export class UpdateTripCategoryDto extends PartialType(CreateTripCategoryDto) {}
