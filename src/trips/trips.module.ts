import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TripsRepository } from './trips.repository';
import { TripImagesController } from './trip-images.controller';
import { TripImagesService } from './trip-images.service';
import { TripImagesRepository } from './trip-images.repository';
import { TripGeneralInfoController } from './trip-general-info.controller';
import { TripGeneralInfoService } from './trip-general-info.service';
import { TripGeneralInfoRepository } from './trip-general-info.repository';
import { TripItemsController } from './trip-items.controller';
import { TripItemsService } from './trip-items.service';
import { TripItemsRepository } from './trip-items.repository';
import { TripAgePriceGroupsController } from './trip-age-price-groups.controller';
import { TripAgePriceGroupsService } from './trip-age-price-groups.service';
import { TripAgePriceGroupsRepository } from './trip-age-price-groups.repository';
import { DatabaseModule } from '../db/database.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [
    TripsController,
    TripImagesController,
    TripGeneralInfoController,
    TripItemsController,
    TripAgePriceGroupsController,
  ],
  providers: [
    TripsService,
    TripsRepository,
    TripImagesService,
    TripImagesRepository,
    TripGeneralInfoService,
    TripGeneralInfoRepository,
    TripItemsService,
    TripItemsRepository,
    TripAgePriceGroupsService,
    TripAgePriceGroupsRepository,
  ],
  exports: [TripsService, TripsRepository],
})
export class TripsModule {}
