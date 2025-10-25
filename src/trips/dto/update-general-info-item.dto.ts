import { PartialType } from '@nestjs/swagger';
import { CreateGeneralInfoItemDto } from './create-general-info-item.dto';

export class UpdateGeneralInfoItemDto extends PartialType(
  CreateGeneralInfoItemDto,
) {}
