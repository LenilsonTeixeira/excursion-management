import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';
import { SignupAgencyDto } from './dto/signup-agency.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { UsersRepository } from './users.repository';
import { InviteTokensRepository } from './invite-tokens.repository';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { TenantsService } from '../tenants/tenants.service';
import { HashService } from '../common/services/hash.service';
import { EmailService } from '../common/services/email.service';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly inviteTokensRepository: InviteTokensRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly tenantsService: TenantsService,
    private readonly hashService: HashService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signupAgency(dto: SignupAgencyDto) {
    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(dto.emailAdmin);
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // Use invite flow if requested
    if (dto.useInviteFlow) {
      return this.createInvite(dto);
    }

    // Self-service flow
    return this.createAgencyDirectly(dto);
  }

  private async createAgencyDirectly(dto: SignupAgencyDto) {
    this.logger.log(`Creating agency directly: ${dto.name}`);

    // Generate slug from name
    const slug = this.generateSlug(dto.name);

    // Create tenant
    const tenant = await this.tenantsService.create({
      name: dto.name,
      slug,
      plan: 'free',
    });

    // Hash password
    const passwordHash = await this.hashService.hashPassword(dto.password);

    // Create admin user
    const adminName = dto.adminName || dto.emailAdmin.split('@')[0];
    const user = await this.usersRepository.create({
      tenantId: tenant.id,
      email: dto.emailAdmin,
      passwordHash,
      role: 'agency_admin',
      name: adminName,
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(
      user.email,
      user.name,
      tenant.slug,
    );

    // Log onboarding event
    this.logger.log(`🎉 Onboarding completed for tenant: ${tenant.slug}`);
    this.logger.log({
      event: 'tenant_onboarding',
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      adminUserId: user.id,
      adminEmail: user.email,
    });

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } =
      await this.generateTokenPair({
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
      });

    return {
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private async createInvite(dto: SignupAgencyDto) {
    this.logger.log(`Creating invite for: ${dto.emailAdmin}`);

    // Generate unique token
    const token = randomBytes(32).toString('hex');

    // Token expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invite token
    const inviteToken = await this.inviteTokensRepository.create({
      token,
      email: dto.emailAdmin,
      tenantName: dto.name,
      role: 'agency_admin',
      expiresAt,
    });

    // Send invite email
    await this.emailService.sendInviteEmail(dto.emailAdmin, dto.name, token);

    this.logger.log(`📧 Invite sent to: ${dto.emailAdmin}`);

    return {
      message: 'Convite enviado com sucesso',
      inviteId: inviteToken.id,
      expiresAt: inviteToken.expiresAt,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verify password
    const isPasswordValid = await this.hashService.comparePassword(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Check if user is active
    if (user.isActive !== 'true') {
      throw new UnauthorizedException('Usuário inativo');
    }

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } =
      await this.generateTokenPair({
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId || undefined,
      });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId || undefined,
      },
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    // Hash the provided refresh token
    const tokenHash = this.hashToken(dto.refreshToken);

    // Find the refresh token
    const storedToken =
      await this.refreshTokensRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Get user
    const user = await this.usersRepository.findById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user is active
    if (user.isActive !== 'true') {
      throw new UnauthorizedException('User is inactive');
    }

    // Revoke the old refresh token (rotation)
    await this.refreshTokensRepository.revoke(storedToken.id);

    this.logger.log(`Refresh token rotated for user: ${user.email}`);

    // Generate new token pair
    const { accessToken, refreshToken, expiresIn } =
      await this.generateTokenPair({
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId || undefined,
      });

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async logout(dto: LogoutDto) {
    // Hash the refresh token
    const tokenHash = this.hashToken(dto.refreshToken);

    // Revoke the refresh token
    await this.refreshTokensRepository.revokeByTokenHash(tokenHash);

    this.logger.log('User logged out successfully');

    return {
      message: 'Logout realizado com sucesso',
    };
  }

  private async generateTokenPair(payload: JwtPayload) {
    // Get expiration times from config
    const accessTokenExpiry =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshTokenExpiry =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '30d';

    // Generate access token
    const accessToken = this.jwtService.sign(payload as any, {
      expiresIn: accessTokenExpiry as any,
    });

    // Generate refresh token (random string)
    const refreshTokenString = randomBytes(64).toString('hex');
    const refreshTokenHash = this.hashToken(refreshTokenString);

    // Calculate expiry date for refresh token
    const expiresAt = new Date();
    const days = this.parseDaysFromExpiry(refreshTokenExpiry);
    expiresAt.setDate(expiresAt.getDate() + days);

    // Store refresh token in database
    await this.refreshTokensRepository.create({
      userId: payload.sub,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    // Parse access token expiry to seconds
    const expiresIn = this.parseExpiryToSeconds(accessTokenExpiry);

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  private parseDaysFromExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 30; // default 30 days

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value / 86400;
      case 'm':
        return value / 1440;
      case 'h':
        return value / 24;
      case 'd':
        return value;
      default:
        return 30;
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .substring(0, 50); // Limit length
  }
}
