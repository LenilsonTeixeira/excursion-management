import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { TenantsModule } from './tenants/tenants.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { AgenciesModule } from './agencies/agencies.module';
import { CancellationPoliciesModule } from './cancellation-policies/cancellation-policies.module';
import { TripsModule } from './trips/trips.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    CommonModule,
    AuthModule,
    TenantsModule,
    AgenciesModule,
    CancellationPoliciesModule,
    TripsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
