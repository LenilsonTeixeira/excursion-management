import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersRepository } from './users.repository';
import { InviteTokensRepository } from './invite-tokens.repository';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { LoginAttemptsService } from './login-attempts.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { HashService } from '../common/services/hash.service';
import { EmailService } from '../common/services/email.service';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import { DatabaseModule } from '../db/database.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    DatabaseModule,
    TenantsModule,
    PassportModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn =
          configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
        return {
          secret:
            configService.get<string>('JWT_SECRET') ||
            'your-secret-key-change-in-production',
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    InviteTokensRepository,
    RefreshTokensRepository,
    LoginAttemptsService,
    JwtStrategy,
    HashService,
    EmailService,
    // Apply JWT guard globally (first)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Apply Roles guard globally (second - for backward compatibility)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Apply Authorization guard globally (third - RBAC + tenant ownership)
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    // Apply Audit interceptor globally
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuthService, UsersRepository, HashService],
})
export class AuthModule {}
