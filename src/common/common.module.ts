import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { TenantResolverMiddleware } from './middleware/tenant-resolver.middleware';
import { TenantsModule } from '../tenants/tenants.module';
import { AgencyTenantGuard } from './guards/agency-tenant.guard';

@Module({
  imports: [TenantsModule],
  providers: [TenantResolverMiddleware, AgencyTenantGuard],
  exports: [TenantResolverMiddleware, AgencyTenantGuard],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantResolverMiddleware).forRoutes('*');
  }
}
