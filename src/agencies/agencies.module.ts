import { Module } from '@nestjs/common';
import { AgenciesService } from './agencies.service';
import { AgenciesController } from './agencies.controller';
import { AgenciesRepository } from './agencies.repository';
import { DatabaseModule } from '../db/database.module';

// Sub-recursos
import { AgencyAddressesService } from './agency-addresses.service';
import { AgencyAddressesController } from './agency-addresses.controller';
import { AgencyAddressesRepository } from './agency-addresses.repository';

import { AgencyPhonesService } from './agency-phones.service';
import { AgencyPhonesController } from './agency-phones.controller';
import { AgencyPhonesRepository } from './agency-phones.repository';

import { AgencyEmailsService } from './agency-emails.service';
import { AgencyEmailsController } from './agency-emails.controller';
import { AgencyEmailsRepository } from './agency-emails.repository';

import { AgencySocialsService } from './agency-socials.service';
import { AgencySocialsController } from './agency-socials.controller';
import { AgencySocialsRepository } from './agency-socials.repository';

import { BoardingLocationsService } from '../boarding-locations/boarding-locations.service';
import { BoardingLocationsController } from '../boarding-locations/boarding-locations.controller';
import { BoardingLocationsRepository } from '../boarding-locations/boarding-locations.repository';

import { CategoriesService } from '../categories/categories.service';
import { CategoriesController } from '../categories/categories.controller';
import { CategoriesRepository } from '../categories/categories.repository';

import { AgeRangesService } from '../age-ranges/age-ranges.service';
import { AgeRangesController } from '../age-ranges/age-ranges.controller';
import { AgeRangesRepository } from '../age-ranges/age-ranges.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [
    AgenciesController,
    AgencyAddressesController,
    AgencyPhonesController,
    AgencyEmailsController,
    AgencySocialsController,
    BoardingLocationsController,
    CategoriesController,
    AgeRangesController,
  ],
  providers: [
    AgenciesService,
    AgencyAddressesService,
    AgencyPhonesService,
    AgencyEmailsService,
    AgencySocialsService,
    BoardingLocationsService,
    CategoriesService,
    AgeRangesService,
    AgenciesRepository,
    AgencyAddressesRepository,
    AgencyPhonesRepository,
    AgencyEmailsRepository,
    AgencySocialsRepository,
    BoardingLocationsRepository,
    CategoriesRepository,
    AgeRangesRepository,
  ],
  exports: [
    AgenciesService,
    AgenciesRepository,
    AgencyAddressesService,
    AgencyAddressesRepository,
    AgencyPhonesService,
    AgencyPhonesRepository,
    AgencyEmailsService,
    AgencyEmailsRepository,
    AgencySocialsService,
    AgencySocialsRepository,
    BoardingLocationsService,
    BoardingLocationsRepository,
    CategoriesService,
    CategoriesRepository,
    AgeRangesService,
    AgeRangesRepository,
  ],
})
export class AgenciesModule {}
