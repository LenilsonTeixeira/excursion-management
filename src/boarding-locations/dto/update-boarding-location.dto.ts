import { PartialType } from '@nestjs/swagger';
import { CreateBoardingLocationDto } from './create-boarding-location.dto';

export class UpdateBoardingLocationDto extends PartialType(
  CreateBoardingLocationDto,
) {}
