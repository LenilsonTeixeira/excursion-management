# ADR 001: Password Policy and Security

**Status**: Accepted  
**Date**: 2025-10-17  
**Deciders**: Development Team

## Context

The system requires a robust password policy to protect user accounts and comply with security best practices. We need to balance security with usability while preventing common attack vectors like brute-force and credential stuffing.

## Decision

We have adopted the following password and security policies:

### 1. Password Strength Requirements

**Minimum Requirements:**

- Minimum length: **8 characters**
- Must contain at least:
  - 1 lowercase letter (a-z)
  - 1 uppercase letter (A-Z)
  - 1 digit (0-9)
  - 1 special character (@$!%\*?&#)

**Implementation:**

```typescript
@Matches(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
  {
    message: 'Senha deve conter letra maiúscula, minúscula, número e caractere especial',
  },
)
```

**Rationale:**

- 8 characters is a reasonable minimum that most users can remember
- Complexity requirements protect against dictionary attacks
- Special characters increase entropy significantly
- NIST SP 800-63B recommends minimum 8 characters for memorized secrets

### 2. Password Hashing

**Algorithm**: **bcrypt**  
**Salt Rounds**: **10** (configurable via `BCRYPT_ROUNDS`)

**Implementation:**

```typescript
@Injectable()
export class HashService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
}
```

**Rationale:**

- bcrypt is specifically designed for password hashing
- Adaptive cost factor allows increasing security as hardware improves
- Built-in salt generation (per-password salt)
- Resistant to rainbow table attacks
- 10 rounds provides good balance between security and performance (~100ms)

**Alternative Considered:**

- argon2: Winner of Password Hashing Competition (PHC), but requires native dependencies
- scrypt: Good choice, but less widely adopted in Node.js ecosystem
- **Decision**: bcrypt for its maturity, wide adoption, and Node.js compatibility

### 3. Brute-Force Protection

**Account Lockout Policy:**

- Maximum failed attempts: **5**
- Lockout duration: **15 minutes**
- Counter reset on successful login

**Rate Limiting:**

- Login endpoint: **5 requests per minute per IP**
- Global rate limit: **10 requests per minute per IP**

**Implementation:**

```typescript
// Account lockout
@Injectable()
export class LoginAttemptsService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
}

// Rate limiting
@Throttle({ default: { limit: 5, ttl: 60000 } })
async login(@Body() loginDto: LoginDto) { ... }
```

**Rationale:**

- 5 attempts is generous for legitimate users while limiting attackers
- 15 minutes is long enough to deter automated attacks
- Rate limiting adds another layer of defense
- In-memory storage is acceptable for MVP (can be replaced with Redis)

### 4. Token Security

**Refresh Token Storage:**

- **Never store refresh tokens in plain text**
- Store SHA-256 hash of refresh token
- Token rotation: old token revoked on refresh

**Access Token:**

- Short-lived: **15 minutes** (configurable)
- JWT with signature verification
- Contains: sub, email, role, tenantId

**Refresh Token:**

- Long-lived: **30 days** (configurable)
- Random 64-byte hex string
- Stored as SHA-256 hash
- One-time use (rotation)

**Implementation:**

```typescript
// Hash before storing
const tokenHash = createHash('sha256').update(refreshTokenString).digest('hex');

await refreshTokensRepository.create({
  userId: payload.sub,
  tokenHash, // Only hash stored, not plain token
  expiresAt,
});
```

**Rationale:**

- SHA-256 is fast and sufficient for token hashing (not passwords)
- Token rotation prevents reuse of compromised tokens
- Short access token lifetime limits damage window
- Hash prevents token exposure if database is compromised

### 5. TLS/HTTPS

**Policy**: **TLS 1.2+ required in production**

**Implementation:**

- Application should run behind reverse proxy (nginx, ALB, etc.)
- Proxy terminates TLS and forwards to application
- Set `trust proxy` in Express if behind proxy
- Environment variable: `NODE_ENV=production`

**Rationale:**

- TLS encryption prevents man-in-the-middle attacks
- Modern TLS versions (1.2, 1.3) are secure
- Let reverse proxy handle TLS termination (best practice)
- Application focus on business logic

### 6. Additional Security Headers

**Helmet.js Integration:**

```typescript
app.use(helmet());
```

**Headers Applied:**

- `X-DNS-Prefetch-Control`: Controls DNS prefetching
- `X-Frame-Options`: Prevents clickjacking (DENY)
- `X-Content-Type-Options`: Prevents MIME sniffing (nosniff)
- `Strict-Transport-Security`: Enforces HTTPS
- `X-XSS-Protection`: XSS filter (1; mode=block)

**Rationale:**

- Defense in depth approach
- Protects against common web vulnerabilities
- Minimal performance overhead
- Industry standard practice

## Consequences

### Positive

1. **Security**: Strong defense against common attacks
2. **Compliance**: Meets industry standards (OWASP, NIST)
3. **User Trust**: Demonstrates commitment to security
4. **Audit Trail**: Comprehensive logging of auth events
5. **Scalability**: Can replace in-memory lockout with Redis

### Negative

1. **User Friction**: Password requirements may frustrate some users
2. **Support Burden**: Locked accounts require support to unlock
3. **Performance**: Bcrypt adds ~100ms latency to auth operations
4. **Complexity**: More code to maintain and test

### Mitigations

1. **Clear Error Messages**: Guide users to create valid passwords
2. **Automatic Unlock**: 15-minute lockout auto-expires
3. **Performance**: 100ms is acceptable for auth operations
4. **Testing**: Comprehensive test suite for security features

## Configuration

All security parameters are configurable via environment variables:

```env
# Bcrypt
BCRYPT_ROUNDS=10

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Environment
NODE_ENV=production
```

## Future Considerations

1. **Password Reuse Prevention**: Store hash history
2. **Password Expiration**: Force periodic password changes (controversial)
3. **2FA/MFA**: Two-factor authentication for high-value accounts
4. **Risk-Based Auth**: Adaptive authentication based on context
5. **Redis Integration**: Distributed lockout tracking
6. **Rate Limit by User**: Not just by IP
7. **CAPTCHA**: After N failed attempts
8. **Email Notifications**: Alert users of suspicious login attempts

## References

- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html) - Digital Identity Guidelines
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [bcrypt documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Helmet.js documentation](https://helmetjs.github.io/)
