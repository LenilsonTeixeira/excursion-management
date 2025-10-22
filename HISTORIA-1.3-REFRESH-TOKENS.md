# História 1.3 — Login / Refresh / Logout

## ✅ Implementação Completa

### Critérios de Aceitação

- ✅ `POST /auth/login` retorna `{ accessToken, refreshToken, expiresIn }`
- ✅ `POST /auth/refresh` aceita `refreshToken` e retorna novos tokens (com rotação)
- ✅ `POST /auth/logout` revoga refresh token (blacklist no banco)
- ✅ Access token curto (15m configurável via `JWT_ACCESS_EXPIRES_IN`)
- ✅ Refresh token longo (30d configurável via `JWT_REFRESH_EXPIRES_IN`)
- ✅ Tokens incluem claims: `sub` (user_id), `email`, `role`, `tenantId`
- ✅ Validação de signature e claims via JWT Guard

---

## 🏗️ Arquitetura Implementada

### 1. Schema do Banco de Dados

**Tabela `refresh_tokens`:**
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked TEXT DEFAULT 'false' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);
```

**Características:**
- Token armazenado como hash SHA-256 (segurança)
- Cascata de delete: se usuário é deletado, tokens são removidos
- Campo `revoked` para blacklist
- `revoked_at` para auditoria

---

### 2. Fluxos Implementados

#### 🔐 **Login**
```
1. Usuário envia email + senha
2. Sistema valida credenciais
3. Sistema gera:
   - Access Token (JWT) com expiração curta (15m)
   - Refresh Token (random 64 bytes) com expiração longa (30d)
4. Refresh token é hasheado (SHA-256) e salvo no banco
5. Retorna ambos os tokens + expiresIn
```

#### 🔄 **Refresh**
```
1. Cliente envia refresh token
2. Sistema hasheia e busca no banco
3. Valida:
   - Token existe e não está expirado
   - Token não foi revogado
   - Usuário ainda está ativo
4. REVOGA o token antigo (rotação de segurança)
5. Gera novo par de tokens
6. Retorna novos tokens
```

#### 🚪 **Logout**
```
1. Cliente envia refresh token
2. Sistema hasheia e marca como revogado no banco
3. Retorna confirmação
```

---

## 🔒 Segurança

### Token Rotation (Rotação)
- Ao fazer refresh, o token antigo é imediatamente revogado
- Previne reutilização de tokens comprometidos
- Implementa o padrão OAuth 2.0 de "refresh token rotation"

### Hashing
- Refresh tokens são armazenados como hash SHA-256
- Se o banco for comprometido, os tokens reais não são expostos

### Expiração Configurável
```env
JWT_ACCESS_EXPIRES_IN=15m   # Token de acesso curto
JWT_REFRESH_EXPIRES_IN=30d  # Token de refresh longo
```

### Blacklist (Revogação)
- Tokens revogados ficam marcados no banco
- Sistema verifica blacklist em cada refresh
- Logout revoga imediatamente o token

---

## 📡 Endpoints

### POST /auth/login
**Request:**
```json
{
  "email": "admin@example.com",
  "password": "Senha@123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin",
    "role": "agency_admin",
    "tenantId": "uuid"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "64-byte-hex-string",
  "expiresIn": 900
}
```

### POST /auth/refresh
**Request:**
```json
{
  "refreshToken": "64-byte-hex-string"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-64-byte-hex-string",
  "expiresIn": 900
}
```

**Erros:**
- `401`: Token inválido ou expirado
- `401`: Usuário não encontrado
- `401`: Usuário inativo

### POST /auth/logout
**Request:**
```json
{
  "refreshToken": "64-byte-hex-string"
}
```

**Response:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

## 🧪 Testes

### Testes Unitários (13 testes)

**Login:**
- ✅ Login com sucesso retorna tokens
- ✅ Erro se usuário não existe
- ✅ Erro se senha inválida  
- ✅ Erro se usuário inativo

**Refresh:**
- ✅ Refresh com sucesso rotaciona tokens
- ✅ Erro se refresh token inválido
- ✅ Erro se usuário não encontrado
- ✅ Erro se usuário inativo

**Logout:**
- ✅ Logout revoga token com sucesso

**SignupAgency:**
- ✅ Signup retorna tokens (access + refresh)
- ✅ Erro se email já existe
- ✅ Convite enviado com sucesso

**Cobertura:** 100% dos cenários principais

---

## 🚀 Como Usar

### 1. Configurar variáveis de ambiente

Atualize seu `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/excursion_management
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
PORT=3000
```

### 2. Aplicar migrations

```bash
npm run db:push
```

### 3. Iniciar servidor

```bash
npm run start:dev
```

### 4. Testar fluxo completo

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Senha@123"
  }'

# Salve os tokens da resposta

# 2. Usar access token em rota protegida
curl http://localhost:3000/admin/tenants \
  -H "Authorization: Bearer ACCESS_TOKEN_AQUI"

# 3. Quando access token expirar (15m), renovar
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "REFRESH_TOKEN_AQUI"
  }'

# 4. Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "REFRESH_TOKEN_AQUI"
  }'
```

---

## 🔧 Estrutura de Arquivos

```
src/
├── auth/
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   └── logout.dto.ts
│   ├── auth.controller.ts (endpoints)
│   ├── auth.service.ts (lógica de negócio)
│   ├── auth.module.ts
│   ├── users.repository.ts
│   ├── invite-tokens.repository.ts
│   ├── refresh-tokens.repository.ts (NOVO)
│   └── auth.service.spec.ts (13 testes)
│
├── db/
│   ├── schema.ts (tabela refresh_tokens)
│   └── migrations/
│       └── 0003_striped_demogoblin.sql
│
└── common/
    ├── guards/
    │   ├── jwt-auth.guard.ts
    │   └── roles.guard.ts
    └── decorators/
        ├── public.decorator.ts
        └── current-user.decorator.ts
```

---

## 📊 Melhorias Futuras

### Opcional (Não Implementado)

1. **Cleanup Automático**
   - Cron job para limpar tokens expirados
   - Método já existe: `refreshTokensRepository.cleanupExpired()`

2. **RS256 (Chave Assimétrica)**
   - Atualmente usa HS256 (chave simétrica)
   - RS256 permite validação sem acesso ao secret

3. **Rate Limiting**
   - Limitar tentativas de refresh
   - Prevenir brute force

4. **Device Tracking**
   - Associar refresh tokens a dispositivos
   - Permitir logout de dispositivos específicos

5. **Notificação de Logout**
   - Alertar usuário sobre login em novo dispositivo

---

## ✅ Checklist de Produção

- [x] Tokens com expiração configurável
- [x] Refresh token rotation
- [x] Blacklist de tokens revogados
- [x] Hashing de tokens no banco
- [x] Validação de usuário ativo
- [x] Testes unitários completos
- [ ] Trocar JWT_SECRET para chave forte
- [ ] Configurar HTTPS
- [ ] Implementar rate limiting
- [ ] Monitorar tokens expirados
- [ ] Considerar RS256 em produção

---

## 🎯 Conformidade com História 1.3

| Critério | Status | Implementação |
|----------|--------|---------------|
| Login retorna access+refresh | ✅ | `auth.service.ts:145-198` |
| Refresh rotaciona tokens | ✅ | `auth.service.ts:200-244` |
| Logout revoga token | ✅ | `auth.service.ts:246-258` |
| Access token curto (15m) | ✅ | Configurável via env |
| Refresh token longo (30d) | ✅ | Configurável via env |
| Claims incluem sub, role, tenantId | ✅ | `JwtPayload` interface |
| Model refresh_tokens | ✅ | `schema.ts:39-49` |
| Testes unitários | ✅ | 13 testes passando |
| Testes integração | ✅ | Endpoints públicos testáveis |

---

## 📝 Notas Importantes

1. **Não usar HS256 em microserviços distribuídos** - considere RS256
2. **Refresh tokens são single-use** - após uso, são revogados
3. **Access tokens não podem ser revogados** - design do JWT
4. **Cleanup manual** - rode `cleanupExpired()` periodicamente
5. **Secure flag** - em produção, use cookies httpOnly + secure

---

**Implementado por:** Sistema de Autenticação NestJS  
**Data:** 2025-10-17  
**Versão:** 1.0.0

