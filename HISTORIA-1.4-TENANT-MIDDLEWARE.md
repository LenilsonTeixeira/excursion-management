# História 1.4 — Middleware de Resolução de Tenant

## ✅ Implementação Completa

### Critérios de Aceitação

- ✅ Header `X-Tenant-ID` funciona (útil para testes/curl)
- ✅ Resolução via subdomínio em produção
- ✅ Middleware valida slug contra `tenants`
- ✅ Retorna 404 se tenant não encontrado
- ✅ `tenant_id` disponível no request context
- ✅ Admin/global routes permitem ausência de tenant
- ✅ Logs incluem tenant slug/id

---

## 🏗️ Arquitetura Implementada

### 1. Middleware de Resolução

**`TenantResolverMiddleware`:**

- Executa em **todas as rotas** antes dos controllers
- Prioridade de resolução:
  1. Header `X-Tenant-ID` (útil para testes)
  2. Subdomínio do host (produção)
- Valida tenant no banco de dados
- Injeta `tenantId` e `tenantSlug` no request

### 2. Rotas Sem Tenant

Rotas que **NÃO requerem** tenant:

- `/admin/*` - Rotas administrativas globais
- `/auth/*` - Autenticação e signup
- `/api` - Documentação Swagger

Para outras rotas, tenant é **obrigatório**.

### 3. Decorators

**`@CurrentTenant()`**

```typescript
// Injeta tenant no método do controller
findAll(@CurrentTenant() tenant: TenantContext) {
  console.log(tenant.tenantId, tenant.tenantSlug);
}
```

**`@RequiresTenant()`**

```typescript
// Marca explicitamente que a rota requer tenant
@Controller('excursions')
@RequiresTenant()
export class ExcursionsController {}
```

**`@NoTenantRequired()`**

```typescript
// Marca explicitamente que a rota NÃO requer tenant
@Controller('public')
@NoTenantRequired()
export class PublicController {}
```

---

## 📡 Como Usar

### Desenvolvimento (Header)

```bash
# Usar header X-Tenant-ID
curl http://localhost:3000/excursions \
  -H "X-Tenant-ID: agencia-viagens" \
  -H "Authorization: Bearer TOKEN"
```

### Produção (Subdomínio)

```bash
# Usar subdomínio
curl https://agencia-viagens.seusite.com/excursions \
  -H "Authorization: Bearer TOKEN"
```

### Localhost com Subdomínio

```bash
# Configurar /etc/hosts
127.0.0.1 agencia-test.localhost

# Acessar
curl http://agencia-test.localhost:3000/excursions \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔍 Exemplos de Resolução

| Host                        | Slug Extraído | Válido?             |
| --------------------------- | ------------- | ------------------- |
| `agencia123.example.com`    | `agencia123`  | ✅                  |
| `agencia123.localhost`      | `agencia123`  | ✅                  |
| `agencia123.localhost:3000` | `agencia123`  | ✅                  |
| `localhost`                 | `undefined`   | ✅ (admin/auth OK)  |
| `localhost:3000`            | `undefined`   | ✅ (admin/auth OK)  |
| `www.example.com`           | `undefined`   | ✅ (www ignorado)   |
| `api.example.com`           | `undefined`   | ✅ (api ignorado)   |
| `example.com`               | `undefined`   | ✅ (sem subdomínio) |

---

## 🎯 Injeção no Request

### Express Request Extensions

```typescript
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantSlug?: string;
    }
  }
}
```

### Acessar no Controller

```typescript
@Controller('excursions')
export class ExcursionsController {
  // Opção 1: Usar decorator
  @Get()
  findAll(@CurrentTenant() tenant: TenantContext) {
    console.log(tenant.tenantId); // uuid
    console.log(tenant.tenantSlug); // string
  }

  // Opção 2: Acessar diretamente do request
  @Get()
  findAll(@Req() req: Request) {
    console.log(req.tenantId);
    console.log(req.tenantSlug);
  }
}
```

### Acessar no Service

```typescript
@Injectable()
export class ExcursionsService {
  // Receber do controller
  findAll(tenantId: string) {
    return this.excursionsRepository.findByTenant(tenantId);
  }
}
```

---

## 📝 Auditoria

O `AuditInterceptor` foi atualizado para incluir tenant:

```json
{
  "timestamp": "2025-10-17T10:30:00.000Z",
  "method": "GET",
  "url": "/excursions",
  "userId": "uuid",
  "userEmail": "user@example.com",
  "userRole": "agency_admin",
  "userTenantId": "uuid-from-jwt",
  "requestTenantId": "uuid-from-middleware",
  "tenantSlug": "agencia-viagens",
  "statusCode": 200,
  "responseTime": "45ms"
}
```

**Observação:** `userTenantId` (do JWT) pode ser diferente de `requestTenantId` (do middleware). Isso permite auditar cross-tenant access.

---

## 🧪 Testes

### Cobertura de Testes (12 testes)

**Header Resolution:**

- ✅ Resolve tenant do header `X-Tenant-ID`
- ✅ Lança NotFoundException se tenant não existe

**Subdomain Resolution:**

- ✅ Resolve de subdomínio simples
- ✅ Resolve de subdomínio com porta
- ✅ Retorna undefined para localhost sem subdomínio
- ✅ Ignora subdomínio `www`

**Rotas Admin/Auth:**

- ✅ Permite `/admin/*` sem tenant
- ✅ Permite `/auth/*` sem tenant
- ✅ Permite `/api` sem tenant

**Outras Rotas:**

- ✅ Requer tenant para rotas não-admin

**Prioridade:**

- ✅ Header `X-Tenant-ID` tem prioridade sobre subdomínio

### Rodar Testes

```bash
npm test -- tenant-resolver.middleware.spec.ts
```

---

## ⚙️ Configuração

### Registrar Middleware

O middleware é registrado automaticamente no `CommonModule`:

```typescript
@Module({
  imports: [TenantsModule],
  providers: [TenantResolverMiddleware],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantResolverMiddleware).forRoutes('*'); // Todas as rotas
  }
}
```

### Ordem de Execução

```
1. TenantResolverMiddleware (resolve tenant)
2. JwtAuthGuard (valida JWT)
3. RolesGuard (valida roles)
4. TenantGuard (valida tenant se @RequiresTenant)
5. AuditInterceptor (audita request)
6. Controller (executa lógica)
```

---

## 🔒 Segurança

### Isolamento de Tenants

- Cada tenant é isolado por subdomínio ou header
- Tenant é validado contra o banco antes de processar
- Logs incluem tanto o tenant do request quanto do JWT

### Prevenção de Cross-Tenant Access

```typescript
@Injectable()
export class ExcursionsService {
  async findOne(id: string, tenantId: string) {
    const excursion = await this.repository.findById(id);

    // Validar que excursão pertence ao tenant
    if (excursion.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return excursion;
  }
}
```

### Validação Dupla

- **Request Tenant:** Extraído do subdomínio/header
- **User Tenant:** Extraído do JWT

Você pode validar que ambos correspondem para maior segurança:

```typescript
if (req.tenantId !== user.tenantId) {
  throw new ForbiddenException('Tenant mismatch');
}
```

---

## 🚀 Migração de Código Existente

### Antes (sem tenant context)

```typescript
@Controller('excursions')
export class ExcursionsController {
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
```

### Depois (com tenant context)

```typescript
@Controller('excursions')
@RequiresTenant() // Explícito
export class ExcursionsController {
  @Get()
  findAll(@CurrentTenant('tenantId') tenantId: string) {
    return this.service.findAll(tenantId);
  }
}
```

---

## 🐛 Troubleshooting

### Erro: "Tenant not found"

```
404 NotFoundException: Tenant not found: agencia-test
```

**Solução:**

- Verifique se o tenant existe no banco
- Verifique o slug está correto (case-sensitive)
- Use `X-Tenant-ID` header para testar

### Erro: "Tenant not specified"

```
404 NotFoundException: Tenant not specified. Provide X-Tenant-ID header...
```

**Solução:**

- Adicione header `X-Tenant-ID`
- Ou use subdomínio: `tenant.localhost`
- Ou marque a rota com `@NoTenantRequired()`

### Subdomínio não é extraído

**Problema:** Usando `localhost` sem subdomínio

**Solução:**

- Use `tenant.localhost` (requer configuração de /etc/hosts)
- Ou use header `X-Tenant-ID` para desenvolvimento

### Tenant no log é undefined

**Problema:** Rota admin não tem tenant (esperado)

**Solução:**

- Rotas admin (`/admin/*`) não requerem tenant
- Para outras rotas, certifique-se de enviar o header `X-Tenant-ID`

---

## 📊 Estrutura de Arquivos

```
src/
├── common/
│   ├── common.module.ts (registra middleware)
│   ├── middleware/
│   │   ├── tenant-resolver.middleware.ts
│   │   └── tenant-resolver.middleware.spec.ts (12 testes)
│   ├── decorators/
│   │   ├── current-tenant.decorator.ts
│   │   └── requires-tenant.decorator.ts
│   ├── guards/
│   │   └── tenant.guard.ts
│   └── interceptors/
│       └── audit.interceptor.ts (atualizado)
│
├── tenants/
│   ├── tenants.module.ts (exporta TenantsRepository)
│   └── tenants.repository.ts
│
└── app.module.ts (importa CommonModule)
```

---

## ✅ Checklist de Implementação

- [x] Middleware de resolução de tenant
- [x] Suporte a header `X-Tenant-ID`
- [x] Suporte a subdomínio
- [x] Validação de tenant no banco
- [x] Decorators `@CurrentTenant`, `@RequiresTenant`
- [x] Guard de tenant
- [x] Rotas admin/auth sem tenant
- [x] Logs com tenant info
- [x] Testes unitários (12 testes)
- [x] Documentação completa

---

## 🎯 Conformidade com História 1.4

| Critério                    | Status | Implementação                         |
| --------------------------- | ------ | ------------------------------------- |
| Header X-Tenant-ID          | ✅     | `tenant-resolver.middleware.ts:29-34` |
| Resolução via subdomínio    | ✅     | `tenant-resolver.middleware.ts:32-41` |
| Validação contra tenants    | ✅     | `tenant-resolver.middleware.ts:60-68` |
| 404 se não encontrado       | ✅     | `tenant-resolver.middleware.ts:62`    |
| tenantId no request context | ✅     | `tenant-resolver.middleware.ts:70-71` |
| Admin routes sem tenant     | ✅     | `tenant-resolver.middleware.ts:44-54` |
| Logs incluem tenant         | ✅     | `audit.interceptor.ts:36-38`          |
| Testes completos            | ✅     | 12 testes passando                    |

---

## 📈 Próximos Passos

Com o middleware de tenant implementado, agora você pode:

1. **Criar módulos tenant-aware** (excursões, reservas, etc)
2. **Implementar row-level security** nos repositories
3. **Adicionar tenant scoping** automático nas queries
4. **Configurar DNS wildcard** para subdomínios em produção

---

**Implementado por:** Sistema Multi-tenant NestJS  
**Data:** 2025-10-17  
**Versão:** 1.0.0
