import { Module } from '@nestjs/common';
import { CancellationPoliciesController } from './cancellation-policies.controller';
import { CancellationPoliciesService } from './cancellation-policies.service';
import { CancellationPoliciesRepository } from './cancellation-policies.repository';
import { DatabaseModule } from '../db/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CancellationPoliciesController],
  providers: [CancellationPoliciesService, CancellationPoliciesRepository],
  exports: [CancellationPoliciesService, CancellationPoliciesRepository],
})
export class CancellationPoliciesModule {}
