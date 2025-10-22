# Environment Variables Template

Copy this content to your `.env` file:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/excursion_management

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Security (História 1.6)
BCRYPT_ROUNDS=10
CORS_ORIGIN=*

# Server
PORT=3000
NODE_ENV=development
```

## Important Notes

**Security (História 1.6):**

- **JWT_SECRET**: MUST be changed in production to a strong random string (32+ characters)
- **BCRYPT_ROUNDS**: Number of bcrypt salt rounds (10 = ~100ms, 12 = ~400ms). Default: 10
- **CORS_ORIGIN**: Allowed origins for CORS. Use specific domain in production (e.g., https://yourdomain.com)
- **NODE_ENV**: Set to "production" to enable TLS requirements and other security features

**Authentication:**

- **JWT_ACCESS_EXPIRES_IN**: Access token expiry (default: 15m) - short-lived
- **JWT_REFRESH_EXPIRES_IN**: Refresh token expiry (default: 30d) - long-lived
- Token expiry formats: "15m" (minutes), "24h" (hours), "7d" (days), "60s" (seconds)

**Database:**

- **DATABASE_URL**: Update with your production database credentials

## Security Best Practices

1. Never commit `.env` file to version control
2. Use different secrets for each environment (dev, staging, prod)
3. Rotate JWT_SECRET periodically
4. Use strong, random values for JWT_SECRET (min 32 characters)
5. Enable HTTPS/TLS in production (NODE_ENV=production)
6. Set specific CORS_ORIGIN in production (not '\*')
7. Increase BCRYPT_ROUNDS for higher security (at cost of performance)
