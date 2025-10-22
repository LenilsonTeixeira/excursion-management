import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginAttemptsService } from './login-attempts.service';
import { SignupAgencyDto } from './dto/signup-agency.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginAttemptsService: LoginAttemptsService,
  ) {}

  @Public()
  @Post('signup-agency')
  @ApiOperation({ summary: 'Signup de nova agência' })
  @ApiResponse({
    status: 201,
    description: 'Agência criada com sucesso ou convite enviado',
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado ou slug já existe',
  })
  signupAgency(@Body() signupAgencyDto: SignupAgencyDto) {
    return this.authService.signupAgency(signupAgencyDto);
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de usuário' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'user@example.com',
          name: 'User Name',
          role: 'agency_admin',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'random-64-byte-hex-string',
        expiresIn: 900,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas - tente novamente mais tarde',
  })
  async login(@Body() loginDto: LoginDto) {
    // Check if account is locked
    if (this.loginAttemptsService.isLocked(loginDto.email)) {
      const remainingTime = this.loginAttemptsService.getLockoutTimeRemaining(
        loginDto.email,
      );
      throw new UnauthorizedException(
        `Conta temporariamente bloqueada. Tente novamente em ${Math.ceil(remainingTime / 60)} minutos.`,
      );
    }

    try {
      const result = await this.authService.login(loginDto);

      // Reset attempts on successful login
      this.loginAttemptsService.resetAttempts(loginDto.email);

      return result;
    } catch (error) {
      // Record failed attempt
      this.loginAttemptsService.recordFailedAttempt(loginDto.email);

      // Get remaining attempts
      const remaining = this.loginAttemptsService.getRemainingAttempts(
        loginDto.email,
      );

      if (remaining > 0) {
        throw new UnauthorizedException(
          `Credenciais inválidas. ${remaining} tentativa(s) restante(s).`,
        );
      }

      throw error;
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados com sucesso',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'new-random-64-byte-hex-string',
        expiresIn: 900,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido ou expirado',
  })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout - revoga refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
  })
  logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto);
  }
}
