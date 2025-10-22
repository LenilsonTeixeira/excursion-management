# Implementação das Histórias 1.1 a 1.6

## ✅ História 1.1 — Criar Tenant (apenas superadmin)

### Implementado

- [x] **DB**: Tabela `tenants` com campo `settings` JSON
- [x] **Backend**: Controller, Service, Repository
- [x] **Validação**: Slug regex, nome obrigatório
- [x] **Migration**: Estrutura completa do banco
- [x] **Testes**: Unitários do service + integração
- [x] **Policy**: Proteção de rotas com role `superadmin`

### Estrutura Criada

```
src/
├── tenants/
│   ├── tenants.controller.ts    (protegido com @Roles('superadmin'))
│   ├── tenants.service.ts
│   ├── tenants.repository.ts
│   └── dto/
│       ├── create-tenant.dto.ts
│       └── update-tenant.dto.ts
```

### Endpoints (Protegidos - Requer token Bearer)

- `POST /admin/tenants` - Criar tenant (superadmin)
- `GET /admin/tenants` - Listar tenants (superadmin)
- `GET /admin/tenants/:id` - Buscar tenant (superadmin)
- `PATCH /admin/tenants/:id` - Atualizar tenant (superadmin)
- `DELETE /admin/tenants/:id` - Remover tenant (superadmin)

---

## ✅ História 1.2 — Signup de agência

### Implementado

- [x] **Endpoint**: `POST /auth/signup-agency` (público)
- [x] **Self-service**: Cria tenant + usuário `agency_admin` + JWT token
- [x] **Invite flow**: Cria token de convite com TTL de 7 dias
- [x] **Email**: Mock SMTP para desenvolvimento
- [x] **Hashing**: Senha com bcrypt (10 rounds)
- [x] **Evento de onboarding**: Log estruturado

### Estrutura Criada

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── users.repository.ts
│   ├── invite-tokens.repository.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── dto/
│       ├── signup-agency.dto.ts
│       └── login.dto.ts
│
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   └── audit.interceptor.ts
│   └── services/
│       ├── hash.service.ts
│       └── email.service.ts
```

### Endpoints Públicos

- `POST /auth/signup-agency` - Criar nova agência
- `POST /auth/login` - Login de usuário

---

## ✅ História 1.3 — Login / Refresh / Logout

### Implementado

- [x] **Login**: Retorna `accessToken`, `refreshToken` e `expiresIn`
- [x] **Refresh**: Rotaciona tokens (revoga o antigo, cria novos)
- [x] **Logout**: Revoga refresh token (blacklist)
- [x] **Access Token**: Curto (15m configurável via `JWT_ACCESS_EXPIRES_IN`)
- [x] **Refresh Token**: Longo (30d configurável via `JWT_REFRESH_EXPIRES_IN`)
- [x] **Claims JWT**: Inclui `sub`, `email`, `role`, `tenantId`
- [x] **Segurança**: Tokens hasheados (SHA-256) no banco

### Estrutura Criada

```
src/
├── auth/
│   ├── refresh-tokens.repository.ts  (NOVO)
│   └── dto/
│       ├── refresh-token.dto.ts       (NOVO)
│       └── logout.dto.ts              (NOVO)
│
├── db/
│   └── schema.ts
│       └── refresh_tokens table       (NOVO)
```

### Endpoints Públicos

- `POST /auth/refresh` - Renovar tokens
- `POST /auth/logout` - Revogar refresh token

### Fluxos de Segurança

**Token Rotation:**

- Ao fazer refresh, o token antigo é imediatamente revogado
- Previne reutilização de tokens comprometidos
- Implementa padrão OAuth 2.0

**Hashing:**

- Refresh tokens armazenados como hash SHA-256
- Proteção contra comprometimento do banco

**Blacklist:**

- Tokens revogados marcados no banco
- Validação em cada operação de refresh

---

## ✅ História 1.4 — Middleware de Resolução de Tenant

### Implementado

- [x] **Header**: Suporte a `X-Tenant-ID` (útil para testes/curl)
- [x] **Subdomínio**: Resolução automática via host (produção)
- [x] **Validação**: Slug validado contra banco de dados
- [x] **Context**: `tenantId` e `tenantSlug` disponíveis no request
- [x] **Admin Routes**: Rotas `/admin/*` e `/auth/*` funcionam sem tenant
- [x] **Auditoria**: Logs incluem tenant slug e ID

### Estrutura Criada

```
src/
├── common/
│   ├── common.module.ts              (NOVO - registra middleware)
│   ├── middleware/
│   │   ├── tenant-resolver.middleware.ts      (NOVO)
│   │   └── tenant-resolver.middleware.spec.ts (NOVO - 12 testes)
│   ├── decorators/
│   │   ├── current-tenant.decorator.ts        (NOVO)
│   │   └── requires-tenant.decorator.ts       (NOVO)
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── tenant.guard.ts                    (NOVO)
│   └── interceptors/
│       └── audit.interceptor.ts               (atualizado)
```

### Funcionalidades

**Resolução de Tenant:**

1. Tenta `X-Tenant-ID` header (prioridade)
2. Fallback para subdomínio do host
3. Valida tenant existe no banco
4. Injeta `tenantId` e `tenantSlug` no request

**Rotas Sem Tenant:**

- `/admin/*` - Rotas administrativas globais
- `/auth/*` - Autenticação e signup
- `/api` - Documentação Swagger

**Decorators:**

- `@CurrentTenant()` - Injeta tenant no controller
- `@RequiresTenant()` - Marca rota como requerendo tenant
- `@NoTenantRequired()` - Marca rota como não requerendo tenant

### Exemplos de Uso

**Desenvolvimento (Header):**

```bash
curl http://localhost:3000/excursions \
  -H "X-Tenant-ID: agencia-viagens"
```

**Produção (Subdomínio):**

```bash
curl https://agencia-viagens.seusite.com/excursions
```

**No Controller:**

```typescript
@Controller('excursions')
@RequiresTenant()
export class ExcursionsController {
  @Get()
  findAll(@CurrentTenant('tenantId') tenantId: string) {
    return this.service.findAll(tenantId);
  }
}
```

---

## ✅ História 1.5 — Authorization Guard / RBAC

### Implementado

- [x] **Guard**: Verifica roles do token e tenant_id do request
- [x] **Superadmin**: Permissão global (acessa qualquer tenant)
- [x] **Agency Admin**: Permissão limitada ao próprio tenant
- [x] **Tenant Ownership**: Validação automática de ownership
- [x] **Decorators**: `@RequireOwnership()`, `@AllowRoles()`
- [x] **Regras**: `isSuperAdmin`, `isAgencyAdmin`, `isSameTenant`
- [x] **Testes**: 15 testes unitários

### Estrutura Criada

```
src/
├── common/
│   ├── guards/
│   │   ├── authorization.guard.ts        (NOVO)
│   │   └── authorization.guard.spec.ts    (NOVO - 15 testes)
│   └── decorators/
│       ├── require-ownership.decorator.ts (NOVO)
│       └── allow-roles.decorator.ts       (NOVO)
```

### Funcionalidades

**Authorization Guard:**

- Valida roles do JWT token
- Verifica tenant ownership (user.tenantId === request.tenantId)
- Superadmin bypassa verificações de tenant
- Aplicado globalmente após JwtAuthGuard e RolesGuard

**Decorators:**

```typescript
@Controller('excursions')
@AllowRoles('agency_admin', 'agent')
@RequireOwnership()
export class ExcursionsController {
  // Apenas agency_admin ou agent do mesmo tenant
}
```

**Regras de Autorização:**

- **Superadmin**: Acesso global a qualquer tenant
- **Agency Admin**: Acesso apenas ao próprio tenant
- **Agent/Customer**: Acesso apenas ao próprio tenant

### Matriz de Permissões

| Role         | Global Access | Tenant Access     | Admin Routes |
| ------------ | ------------- | ----------------- | ------------ |
| superadmin   | ✅ Sim        | ✅ Todos          | ✅ Sim       |
| agency_admin | ❌ Não        | ✅ Próprio tenant | ❌ Não       |
| agent        | ❌ Não        | ✅ Próprio tenant | ❌ Não       |
| customer     | ❌ Não        | ✅ Próprio tenant | ❌ Não       |

---

## ✅ História 1.6 — Hashing, Políticas e Segurança

### Implementado

- [x] **Bcrypt Configurável**: Salt rounds configurável via `BCRYPT_ROUNDS`
- [x] **Política de Senha Forte**: Mínimo 8 caracteres com complexidade
- [x] **Account Lockout**: 5 tentativas, bloqueio de 15 minutos
- [x] **Rate Limiting**: 5 req/min no login, 10 req/min global
- [x] **Hash de Refresh Tokens**: SHA-256, nunca armazenado em plain text
- [x] **Security Headers**: Helmet.js com proteções HTTP
- [x] **CORS Configurável**: Configurável por ambiente
- [x] **ADR**: Documentação de decisões de segurança
- [x] **Testes**: 18 testes unitários de segurança

### Estrutura Criada

```
src/
├── auth/
│   ├── login-attempts.service.ts          (NOVO)
│   ├── login-attempts.service.spec.ts     (NOVO - 18 testes)
│   ├── auth.controller.ts                  (atualizado)
│   └── auth.module.ts                      (atualizado)
│
├── common/
│   └── services/
│       └── hash.service.ts                 (atualizado)
│
├── main.ts                                 (atualizado)
│
docs/
└── ADR-001-Password-Policy.md             (NOVO)
```

### Funcionalidades

**Proteção Brute-Force:**

- Account lockout após 5 tentativas falhadas
- Bloqueio de 15 minutos
- Reset automático após expiração
- Mensagens informativas ao usuário

**Rate Limiting:**

```typescript
// Global: 10 requests/min
ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])

// Login: 5 requests/min
@Throttle({ default: { limit: 5, ttl: 60000 } })
```

**Security Headers (Helmet):**

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- X-XSS-Protection

**Hashing:**

- Senhas: bcrypt com 10 rounds (configurável)
- Refresh tokens: SHA-256

---

## 🔐 Sistema de Autenticação e Autorização

### Guards Implementados

1. **JwtAuthGuard** (Global)
   - Valida token JWT em todas as rotas (exceto `@Public()`)
   - Extrai informações do usuário do token

2. **RolesGuard** (Global)
   - Verifica permissões baseadas em roles
   - Usa decorator `@Roles('superadmin', 'agency_admin', ...)`

3. **TenantGuard** (Opcional)
   - Valida que tenant está presente quando `@RequiresTenant()` é usado
   - Útil para rotas que precisam de tenant explicitamente

4. **AuthorizationGuard** (Global - NOVO) ⭐
   - Verifica roles E tenant ownership
   - Superadmin tem acesso global (bypassa tenant checks)
   - Agency admin limitado ao próprio tenant
   - Usa decorators `@RequireOwnership()` e `@AllowRoles()`

### Decorators Customizados

- `@Public()` - Marca rotas como públicas (sem autenticação)
- `@Roles(...roles)` - Define roles permitidas em uma rota
- `@CurrentUser()` - Injeta dados do usuário autenticado
- `@CurrentTenant()` - Injeta dados do tenant do request
- `@RequiresTenant()` - Marca rota como requerendo tenant
- `@NoTenantRequired()` - Marca rota como não requerendo tenant
- `@RequireOwnership()` - Valida tenant ownership (user.tenantId === request.tenantId) ⭐ NOVO
- `@AllowRoles(...roles)` - Alias semântico para `@Roles()` ⭐ NOVO

### Exemplo de Uso

```typescript
@Controller('admin/tenants')
@Roles('superadmin') // Apenas superadmin
export class TenantsController {
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    // user.sub (id), user.email, user.role, user.tenantId
  }
}

// Exemplo com tenant
@Controller('excursions')
@RequiresTenant()
export class ExcursionsController {
  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @CurrentTenant('tenantId') tenantId: string,
  ) {
    // tenantId do request (subdomínio ou header)
  }
}

// Exemplo com RBAC + Ownership (História 1.5)
@Controller('bookings')
@AllowRoles('agency_admin', 'agent')
@RequireOwnership()
export class BookingsController {
  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @CurrentTenant('tenantId') tenantId: string,
  ) {
    // Apenas agency_admin ou agent
    // E apenas do mesmo tenant
    // Superadmin pode acessar qualquer tenant
  }
}
```

---

## 📊 Schema do Banco de Dados

### Tabela `tenants`

```sql
id          uuid PRIMARY KEY
name        text NOT NULL
slug        text NOT NULL UNIQUE
plan        text DEFAULT 'free'
settings    jsonb DEFAULT '{}'
created_at  timestamp
updated_at  timestamp
```

### Tabela `users`

```sql
id            uuid PRIMARY KEY
tenant_id     uuid REFERENCES tenants(id) ON DELETE CASCADE
email         text NOT NULL UNIQUE
password_hash text NOT NULL
role          text NOT NULL  -- 'superadmin', 'agency_admin', 'agent', 'customer'
name          text NOT NULL
is_active     text DEFAULT 'true'
created_at    timestamp
updated_at    timestamp
```

### Tabela `invite_tokens`

```sql
id           uuid PRIMARY KEY
token        text NOT NULL UNIQUE
email        text NOT NULL
tenant_name  text NOT NULL
role         text DEFAULT 'agency_admin'
expires_at   timestamp NOT NULL
used_at      timestamp
created_at   timestamp
```

### Tabela `refresh_tokens` (NOVO - História 1.3)

```sql
id           uuid PRIMARY KEY
user_id      uuid REFERENCES users(id) ON DELETE CASCADE
token_hash   text NOT NULL UNIQUE
expires_at   timestamp NOT NULL
revoked      text DEFAULT 'false'
created_at   timestamp
revoked_at   timestamp
```

---

## 🧪 Testes

### Testes Unitários

- ✅ `auth.service.spec.ts` (13 testes)
  - Signup self-service
  - Signup invite flow
  - Login com validações
  - Refresh token com rotação
  - Logout com revogação

- ✅ `auth.controller.spec.ts` (3 testes)
  - Integração controller-service

- ✅ `tenant-resolver.middleware.spec.ts` (12 testes)
  - Resolução via header X-Tenant-ID
  - Resolução via subdomínio (com e sem porta)
  - Validação de tenant no banco
  - Rotas admin/auth sem tenant
  - Prioridade header sobre subdomínio
  - Tratamento de erros (tenant não encontrado)

- ✅ `authorization.guard.spec.ts` (15 testes)
  - Role-based access control (4 testes)
  - Tenant ownership validation (5 testes)
  - Combined role + ownership (3 testes)
  - Edge cases (3 testes)

- ✅ `login-attempts.service.spec.ts` (18 testes)
  - Record failed attempts (3 testes)
  - Reset attempts (2 testes)
  - Account locking (3 testes)
  - Lockout time (2 testes)
  - Attempt counting (3 testes)
  - Multiple users (2 testes)

### Testes E2E

- ✅ `auth.e2e.spec.ts`
  - Fluxo completo de signup
  - Login e autenticação
  - Proteção de rotas

### Rodar Testes

```bash
# Todos os testes
npm test

# Específico
npm test -- auth.service.spec.ts

# Com coverage
npm test -- --coverage
```

---

## 🚀 Como Usar

### 1. Setup do Ambiente

```bash
# Copiar .env.example
cp .env.example .env

# Editar .env com suas configurações
# Importante: Trocar JWT_SECRET em produção!
```

### 2. Rodar Migrations

```bash
npm run db:migrate
```

### 3. Iniciar Servidor

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

### 4. Criar Primeiro Superadmin

```bash
POST http://localhost:3000/auth/signup-agency
Content-Type: application/json

{
  "name": "Admin Agency",
  "emailAdmin": "superadmin@example.com",
  "password": "SuperAdmin@123",
  "adminName": "Super Admin"
}
```

**Nota**: Você precisará atualizar manualmente o role deste usuário para `superadmin` no banco:

```sql
UPDATE users
SET role = 'superadmin'
WHERE email = 'superadmin@example.com';
```

### 5. Fazer Login

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "superadmin@example.com",
  "password": "SuperAdmin@123"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "email": "superadmin@example.com",
    "name": "Super Admin",
    "role": "superadmin",
    "tenantId": "uuid"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "64-byte-hex-string",
  "expiresIn": 900
}
```

**Salve o refreshToken para renovar o access token!**

### 6. Renovar Tokens (quando access token expirar)

```bash
POST http://localhost:3000/auth/refresh
Content-Type: application/json

{
  "refreshToken": "SEU_REFRESH_TOKEN_AQUI"
}
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-64-byte-hex-string",
  "expiresIn": 900
}
```

### 7. Acessar Rotas Protegidas

```bash
GET http://localhost:3000/admin/tenants
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 8. Logout (revogar refresh token)

```bash
POST http://localhost:3000/auth/logout
Content-Type: application/json

{
  "refreshToken": "SEU_REFRESH_TOKEN_AQUI"
}
```

### 9. Usar Tenant em Requisições

Para acessar rotas tenant-scoped, você precisa fornecer o tenant:

**Opção 1: Header (Desenvolvimento):**

```bash
GET http://localhost:3000/excursions
Authorization: Bearer TOKEN_AQUI
X-Tenant-ID: agencia-viagens
```

**Opção 2: Subdomínio (Produção):**

```bash
GET https://agencia-viagens.seusite.com/excursions
Authorization: Bearer TOKEN_AQUI
```

**Opção 3: Localhost com Subdomínio:**

Edite `/etc/hosts`:

```
127.0.0.1 agencia-viagens.localhost
```

Então acesse:

```bash
GET http://agencia-viagens.localhost:3000/excursions
Authorization: Bearer TOKEN_AQUI
```

---

## 📝 Auditoria

Todas as requisições autenticadas são auditadas automaticamente pelo `AuditInterceptor`:

```json
{
  "timestamp": "2025-10-17T10:30:00.000Z",
  "method": "POST",
  "url": "/excursions",
  "userId": "uuid",
  "userEmail": "user@example.com",
  "userRole": "agency_admin",
  "userTenantId": "uuid-from-jwt",
  "requestTenantId": "uuid-from-middleware",
  "tenantSlug": "agencia-viagens",
  "statusCode": 201,
  "responseTime": "45ms"
}
```

**Campos de Auditoria:**

- `userTenantId`: Tenant do JWT do usuário
- `requestTenantId`: Tenant do request (subdomínio/header)
- `tenantSlug`: Slug do tenant para fácil identificação

Campos sensíveis (password, token, etc) são automaticamente removidos dos logs.

---

## 📧 Email Service (Mock)

Durante desenvolvimento, os emails são apenas logados no console:

```
📧 [MOCK EMAIL] ===================================
To: admin@agencia.com
Subject: Bem-vindo à Plataforma de Excursões
---
<html>...</html>
================================================
```

Para produção, integre com:

- SendGrid
- AWS SES
- Mailgun
- Outro provedor SMTP

---

## 🔒 Segurança

### Implementado

- ✅ Hashing de senhas com bcrypt (10 rounds)
- ✅ JWT com expiração configurável
- ✅ Refresh token rotation (OAuth 2.0)
- ✅ Tokens hasheados no banco (SHA-256)
- ✅ Blacklist de tokens revogados
- ✅ Validação de senha forte (maiúscula, minúscula, número, especial)
- ✅ Guards de autenticação e autorização globais
- ✅ Sanitização de logs (remove dados sensíveis)
- ✅ Isolamento de tenants via middleware (História 1.4)
- ✅ Validação de tenant em cada requisição
- ✅ Auditoria com tenant tracking
- ✅ RBAC com tenant ownership (História 1.5)
- ✅ Superadmin com acesso global
- ✅ Agency admin limitado ao próprio tenant
- ✅ Proteção contra brute-force (História 1.6)
- ✅ Rate limiting em endpoints críticos
- ✅ Security headers (Helmet.js)

### Configuração de Tokens

```env
# Access token: curta duração (15 minutos)
JWT_ACCESS_EXPIRES_IN=15m

# Refresh token: longa duração (30 dias)
JWT_REFRESH_EXPIRES_IN=30d

# Secret (TROCAR EM PRODUÇÃO!)
JWT_SECRET=your-secret-key-change-in-production
```

### Recomendações para Produção

1. **JWT_SECRET**: Use uma chave forte e aleatória (32+ caracteres)
2. **HTTPS**: Sempre use HTTPS em produção
3. **Rate Limiting**: Adicione rate limiting nos endpoints públicos
4. **CORS**: Configure CORS adequadamente
5. **Helmet**: Use helmet para headers de segurança
6. **Validação**: Todas as entradas já são validadas com class-validator
7. **RS256**: Considere usar chaves assimétricas (RS256) ao invés de HS256
8. **Cleanup**: Execute periodicamente `refreshTokensRepository.cleanupExpired()`
9. **DNS Wildcard**: Configure DNS wildcard para subdomínios em produção (\*.seusite.com)
10. **Tenant Isolation**: Sempre valide tenantId nas queries para prevenir cross-tenant access

---

## 📚 Swagger / OpenAPI

Acesse a documentação interativa em:

```
http://localhost:3000/api
```

A documentação inclui:

- Todos os endpoints
- Schemas de request/response
- Autenticação Bearer (use o botão "Authorize")

---

## 🎯 Próximos Passos

Conforme o roadmap do projeto, as próximas histórias podem incluir:

- História 1.7: Gestão de usuários por tenant
- História 2.x: CRUD de excursões (tenant-scoped com RBAC)
- História 3.x: Sistema de reservas
- História 4.x: Pagamentos

## 📈 Status de Implementação

| História                   | Status  | Componentes                                     | Testes         |
| -------------------------- | ------- | ----------------------------------------------- | -------------- |
| 1.1 - CRUD Tenants         | ✅      | 5 endpoints                                     | ✅ 21 testes   |
| 1.2 - Signup Agência       | ✅      | 2 endpoints                                     | ✅ 13 testes   |
| 1.3 - Login/Refresh/Logout | ✅      | 4 endpoints                                     | ✅ 13 testes   |
| 1.4 - Middleware Tenant    | ✅      | 1 middleware + decorators                       | ✅ 12 testes   |
| 1.5 - Authorization Guard  | ✅      | 1 guard + 2 decorators                          | ✅ 15 testes   |
| 1.6 - Security Hardening   | ✅      | Lockout + Rate limit + Helmet + ADR             | ✅ 18 testes   |
| H1 - Gestão de Agências    | ✅      | 5 endpoints + RBAC + tenant ownership           | ✅ 30 testes   |
| **Total**                  | **7/7** | **16 endpoints + middleware + RBAC + security** | **122 testes** |

---

## 🐛 Troubleshooting

### Erro: "UnauthorizedException: Unauthorized"

- Verifique se o token JWT está sendo enviado no header `Authorization: Bearer <token>`
- Verifique se o token não expirou

### Erro: "ForbiddenException: Access denied"

- Verifique se o usuário tem a role necessária para acessar a rota
- Verifique se o usuário pertence ao mesmo tenant do recurso
- Superadmin bypassa verificações de tenant
- Use `@CurrentUser()` para debugar as informações do usuário

### Email não está sendo enviado

- Durante desenvolvimento, emails são apenas logados no console
- Verifique os logs da aplicação

### Testes falhando

- Certifique-se de que o banco está rodando (Docker Compose)
- Execute `npm run db:push` antes dos testes E2E

### Refresh token inválido ou expirado

- Faça login novamente para obter novos tokens
- Access tokens expiram em 15 minutos (padrão)
- Refresh tokens expiram em 30 dias (padrão)
- Tokens revogados no logout não podem ser reutilizados

### Erro: "Tenant not found"

- Verifique se o tenant existe no banco de dados
- Verifique se o slug está correto (case-sensitive)
- Use header `X-Tenant-ID` para testes locais

### Erro: "Tenant not specified"

- Adicione header `X-Tenant-ID` no request
- Ou use subdomínio: `tenant.localhost`
- Rotas `/admin/*` e `/auth/*` não requerem tenant

### Subdomínio não funciona em localhost

- Configure `/etc/hosts`: `127.0.0.1 tenant.localhost`
- Ou use header `X-Tenant-ID` para desenvolvimento
- Subdomínios funcionam automaticamente em produção com DNS wildcard

---

## ✅ História H1 — Gestão de Agências por Tenant

### Implementado

- [x] **DB**: Tabela `agencies` com relacionamento FK para `tenants`
- [x] **Backend**: Controller, Service, Repository completos
- [x] **Validação**: CADASTUR e CNPJ únicos, formatos validados
- [x] **RBAC**: Superadmin cria/remove, agency_admin visualiza/atualiza próprio tenant
- [x] **Migration**: Estrutura completa aplicada no banco
- [x] **Testes**: 30 testes (22 unitários + 8 e2e)
- [x] **Documentação**: Swagger + documentação completa

### Estrutura Criada

```
src/
├── agencies/
│   ├── dto/
│   │   ├── create-agency.dto.ts
│   │   └── update-agency.dto.ts
│   ├── agencies.controller.ts    (RBAC + tenant ownership)
│   ├── agencies.service.ts
│   ├── agencies.repository.ts
│   ├── agencies.module.ts
│   ├── agencies.service.spec.ts  (22 testes)
│   ├── agencies.controller.spec.ts (8 testes)
│   └── agencies.e2e-spec.ts       (8 testes)
```

### Endpoints (Protegidos - Requer token Bearer)

- `POST /agencies/tenants/:tenantId/agencies` - Criar agência (superadmin)
- `GET /agencies/tenants/:tenantId/agencies` - Listar agências (superadmin)
- `GET /agencies/:id` - Detalhar agência (superadmin/agency_admin)
- `PATCH /agencies/:id` - Atualizar agência (superadmin/agency_admin)
- `DELETE /agencies/:id` - Remover agência (superadmin)

### Características

**Relacionamento Multi-tenant:**

- Cada agência pertence a um tenant específico
- Cascade delete: tenant removido → agências removidas
- Isolamento completo entre tenants

**Validações de Negócio:**

- CADASTUR único globalmente (formato XX.XXXXX.XX/XXXX-XX)
- CNPJ único globalmente (formato XX.XXX.XXX/XXXX-XX)
- Nome obrigatório (2-100 caracteres)
- Descrição opcional (máximo 500 caracteres)

**Sistema de Autorização:**

- Superadmin: acesso global a todas as operações
- Agency Admin: acesso limitado ao próprio tenant
- Tenant ownership validado automaticamente
- Headers `X-Tenant-ID` ou subdomínio para agency_admin

---

## ✅ História H1.1 — Sub-recursos de Agências

### Implementado

- [x] **DB**: 4 tabelas de sub-recursos (addresses, phones, emails, socials)
- [x] **Backend**: Controllers, Services, Repositories para cada sub-recurso
- [x] **Validações**: Formatos específicos (CEP, telefone, email, URL)
- [x] **Migration**: Estrutura completa das tabelas de sub-recursos
- [x] **Testes**: Unitários, integração e E2E completos
- [x] **RBAC**: Controle de acesso por roles e tenant ownership
- [x] **Endpoints aninhados**: RESTful com estrutura /agencies/:id/sub-resource
- [x] **Validações de unicidade**: Telefones, emails e plataformas únicas
- [x] **Recursos principais**: Sistema de marcação de registros principais

### Estrutura Criada

```
src/
├── agencies/
│   ├── agency-addresses.controller.ts
│   ├── agency-addresses.service.ts
│   ├── agency-addresses.repository.ts
│   ├── agency-phones.controller.ts
│   ├── agency-phones.service.ts
│   ├── agency-phones.repository.ts
│   ├── agency-emails.controller.ts
│   ├── agency-emails.service.ts
│   ├── agency-emails.repository.ts
│   ├── agency-socials.controller.ts
│   ├── agency-socials.service.ts
│   ├── agency-socials.repository.ts
│   └── dto/
│       ├── create-agency-address.dto.ts
│       ├── create-agency-phone.dto.ts
│       ├── create-agency-email.dto.ts
│       └── create-agency-social.dto.ts
```

### Endpoints (Protegidos - Requer token Bearer)

#### Endereços

- `POST /agencies/:agencyId/addresses` - Criar endereço (superadmin)
- `GET /agencies/:agencyId/addresses` - Listar endereços (superadmin/agency_admin)
- `GET /agencies/:agencyId/addresses/:id` - Obter endereço (superadmin/agency_admin)
- `PATCH /agencies/:agencyId/addresses/:id` - Atualizar endereço (superadmin/agency_admin)
- `DELETE /agencies/:agencyId/addresses/:id` - Remover endereço (superadmin)
- `GET /agencies/:agencyId/addresses/main/current` - Endereço principal
- `GET /agencies/:agencyId/addresses/count/total` - Contar endereços

#### Telefones

- `POST /agencies/:agencyId/phones` - Criar telefone (superadmin)
- `GET /agencies/:agencyId/phones` - Listar telefones (superadmin/agency_admin)
- `GET /agencies/:agencyId/phones/:id` - Obter telefone (superadmin/agency_admin)
- `PATCH /agencies/:agencyId/phones/:id` - Atualizar telefone (superadmin/agency_admin)
- `DELETE /agencies/:agencyId/phones/:id` - Remover telefone (superadmin)
- `GET /agencies/:agencyId/phones/main/current` - Telefone principal
- `GET /agencies/:agencyId/phones/count/total` - Contar telefones

#### Emails

- `POST /agencies/:agencyId/emails` - Criar email (superadmin)
- `GET /agencies/:agencyId/emails` - Listar emails (superadmin/agency_admin)
- `GET /agencies/:agencyId/emails/:id` - Obter email (superadmin/agency_admin)
- `PATCH /agencies/:agencyId/emails/:id` - Atualizar email (superadmin/agency_admin)
- `DELETE /agencies/:agencyId/emails/:id` - Remover email (superadmin)
- `GET /agencies/:agencyId/emails/main/current` - Email principal
- `GET /agencies/:agencyId/emails/count/total` - Contar emails

#### Redes Sociais

- `POST /agencies/:agencyId/socials` - Criar rede social (superadmin)
- `GET /agencies/:agencyId/socials` - Listar redes sociais (superadmin/agency_admin)
- `GET /agencies/:agencyId/socials/active` - Listar ativas (superadmin/agency_admin)
- `GET /agencies/:agencyId/socials/:id` - Obter rede social (superadmin/agency_admin)
- `PATCH /agencies/:agencyId/socials/:id` - Atualizar rede social (superadmin/agency_admin)
- `DELETE /agencies/:agencyId/socials/:id` - Remover rede social (superadmin)
- `GET /agencies/:agencyId/socials/platform/:platform` - Por plataforma
- `GET /agencies/:agencyId/socials/count/total` - Contar redes sociais

### Características

- **Validações específicas**: CEP brasileiro, telefone formatado, email válido, URL válida
- **Unicidade**: Telefones e emails únicos globalmente, plataformas únicas por agência
- **Recursos principais**: Sistema de marcação automática de registros principais
- **Tenant ownership**: Validação de pertencimento ao tenant da agência
- **Cascata**: Exclusão da agência remove todos os sub-recursos
- **RBAC**: Superadmin cria/remove, agency_admin visualiza/atualiza

### Documentação

- [HISTORIA-H1.1-SUB-RECURSOS-AGENCIAS.md](./HISTORIA-H1.1-SUB-RECURSOS-AGENCIAS.md) - Documentação completa

---

## 📚 Documentação Adicional

Para mais detalhes sobre implementações específicas, consulte:

- `HISTORIA-1.3-REFRESH-TOKENS.md` - Documentação completa sobre refresh tokens
- `HISTORIA-1.4-TENANT-MIDDLEWARE.md` - Documentação completa sobre middleware de tenant
- `HISTORIA-1.5-AUTHORIZATION-GUARD.md` - Documentação completa sobre RBAC e tenant ownership
- `HISTORIA-1.6-SECURITY-HARDENING.md` - Documentação completa sobre segurança e hardening
- `HISTORIA-H1-AGENCIES.md` - Documentação completa sobre gestão de agências
- `HISTORIA-H1.1-SUB-RECURSOS-AGENCIAS.md` - Documentação completa sobre sub-recursos de agências
- `docs/ADR-001-Password-Policy.md` - ADR sobre políticas de senha e segurança
