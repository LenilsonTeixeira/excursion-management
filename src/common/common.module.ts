import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { TenantResolverMiddleware } from './middleware/tenant-resolver.middleware';
import { TenantsModule } from '../tenants/tenants.module';
import { AgencyTenantGuard } from './guards/agency-tenant.guard';
import { S3UploadService } from './services/s3-upload.service';

@Module({
  imports: [TenantsModule],
  providers: [TenantResolverMiddleware, AgencyTenantGuard, S3UploadService],
  exports: [TenantResolverMiddleware, AgencyTenantGuard, S3UploadService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantResolverMiddleware).forRoutes('*');
  }
}
