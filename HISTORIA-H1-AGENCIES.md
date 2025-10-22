# História H1 — Gestão de Agências por Tenant

## ✅ Implementação Completa

### Critérios de Aceitação

- ✅ Um tenant pode ter 1 ou mais agências
- ✅ Cada agência tem: Nome, CADASTUR, CNPJ, descrição, datas de criação/modificação
- ✅ É possível criar, editar e remover uma agência
- ✅ Apenas usuários com role = SUPERADMIN podem criar ou excluir agências
- ✅ Cada agência herda o tenant_id do contexto
- ✅ Validação de unicidade de CADASTUR e CNPJ
- ✅ RBAC com tenant ownership para agency_admin

---

## 🏗️ Arquitetura Implementada

### 1. Schema do Banco de Dados

**Tabela `agencies`:**

```sql
CREATE TABLE "agencies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "name" text NOT NULL,
  "cadastur" text NOT NULL,
  "cnpj" text NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "agencies_cadastur_unique" UNIQUE("cadastur"),
  CONSTRAINT "agencies_cnpj_unique" UNIQUE("cnpj")
);

ALTER TABLE "agencies" ADD CONSTRAINT "agencies_tenant_id_tenants_id_fk"
FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id")
ON DELETE cascade ON UPDATE no action;
```

**Características:**

- Relacionamento com tenant via foreign key
- CADASTUR e CNPJ únicos globalmente
- Cascade delete: se tenant é deletado, agências são removidas
- Campos de auditoria (created_at, updated_at)

---

## 📡 Endpoints Implementados

### POST /agencies/tenants/:tenantId/agencies

**Descrição:** Cria uma nova agência vinculada ao tenant  
**Autorização:** SUPERADMIN

**Request:**

```json
{
  "name": "Agência de Viagens ABC",
  "cadastur": "12.34567.89/0001-12",
  "cnpj": "12.345.678/0001-90",
  "description": "Agência especializada em turismo nacional"
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "name": "Agência de Viagens ABC",
  "cadastur": "12.34567.89/0001-12",
  "cnpj": "12.345.678/0001-90",
  "description": "Agência especializada em turismo nacional",
  "createdAt": "2025-01-17T10:30:00.000Z",
  "updatedAt": "2025-01-17T10:30:00.000Z"
}
```

**Erros:**

- `400`: Dados inválidos (validação de formato)
- `401`: Não autorizado
- `403`: Acesso negado (role insuficiente)
- `409`: CADASTUR ou CNPJ já em uso

### GET /agencies/tenants/:tenantId/agencies

**Descrição:** Lista todas as agências de um tenant  
**Autorização:** SUPERADMIN

**Response (200):**

```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "Agência de Viagens ABC",
    "cadastur": "12.34567.89/0001-12",
    "cnpj": "12.345.678/0001-90",
    "description": "Agência especializada em turismo nacional",
    "createdAt": "2025-01-17T10:30:00.000Z",
    "updatedAt": "2025-01-17T10:30:00.000Z"
  }
]
```

### GET /agencies/:id

**Descrição:** Detalha uma agência específica  
**Autorização:** SUPERADMIN / AGENCY_ADMIN (com tenant ownership)

**Headers:**

- `Authorization: Bearer <token>`
- `X-Tenant-ID: tenant-slug` (para agency_admin)

**Response (200):**

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "name": "Agência de Viagens ABC",
  "cadastur": "12.34567.89/0001-12",
  "cnpj": "12.345.678/0001-90",
  "description": "Agência especializada em turismo nacional",
  "createdAt": "2025-01-17T10:30:00.000Z",
  "updatedAt": "2025-01-17T10:30:00.000Z"
}
```

**Erros:**

- `401`: Não autorizado
- `403`: Acesso negado (tenant ownership)
- `404`: Agência não encontrada

### PUT /agencies/:id

**Descrição:** Atualiza dados da agência  
**Autorização:** SUPERADMIN / AGENCY_ADMIN (com tenant ownership)

**Request:**

```json
{
  "name": "Agência de Viagens ABC Atualizada",
  "description": "Nova descrição da agência"
}
```

**Response (200):**

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "name": "Agência de Viagens ABC Atualizada",
  "cadastur": "12.34567.89/0001-12",
  "cnpj": "12.345.678/0001-90",
  "description": "Nova descrição da agência",
  "createdAt": "2025-01-17T10:30:00.000Z",
  "updatedAt": "2025-01-17T11:00:00.000Z"
}
```

**Erros:**

- `400`: Dados inválidos
- `401`: Não autorizado
- `403`: Acesso negado (tenant ownership)
- `404`: Agência não encontrada
- `409`: CADASTUR ou CNPJ já em uso

### DELETE /agencies/:id

**Descrição:** Remove uma agência  
**Autorização:** SUPERADMIN

**Response (204):** Sem conteúdo

**Erros:**

- `401`: Não autorizado
- `403`: Acesso negado (role insuficiente)
- `404`: Agência não encontrada

---

## 🔐 Sistema de Autorização

### Matriz de Permissões

| Role         | Criar Agência | Listar Agências | Ver Agência | Atualizar Agência | Remover Agência |
| ------------ | ------------- | --------------- | ----------- | ----------------- | --------------- |
| superadmin   | ✅ Sim        | ✅ Sim          | ✅ Sim      | ✅ Sim            | ✅ Sim          |
| agency_admin | ❌ Não        | ❌ Não          | ✅ Próprio  | ✅ Próprio        | ❌ Não          |
| agent        | ❌ Não        | ❌ Não          | ❌ Não      | ❌ Não            | ❌ Não          |
| customer     | ❌ Não        | ❌ Não          | ❌ Não      | ❌ Não            | ❌ Não          |

### Regras de Acesso

**Superadmin:**

- Acesso global a todas as operações
- Pode criar/remover agências em qualquer tenant
- Bypassa verificações de tenant ownership

**Agency Admin:**

- Acesso limitado ao próprio tenant
- Pode visualizar e atualizar agências do próprio tenant
- Não pode criar ou remover agências
- Requer header `X-Tenant-ID` ou subdomínio

---

## 🧪 Testes Implementados

### Testes Unitários

**AgenciesService (15 testes):**

- ✅ Criação de agência com validações
- ✅ Validação de CADASTUR único
- ✅ Validação de CNPJ único
- ✅ Busca por tenant
- ✅ Busca por ID
- ✅ Atualização com validações
- ✅ Remoção de agência
- ✅ Contagem por tenant
- ✅ Validação de acesso por tenant

**AgenciesController (8 testes):**

- ✅ Criação via controller
- ✅ Listagem por tenant
- ✅ Busca por ID (superadmin)
- ✅ Busca por ID (agency_admin)
- ✅ Atualização (superadmin)
- ✅ Atualização (agency_admin)
- ✅ Remoção de agência

### Testes E2E

**Agencies E2E (8 testes):**

- ✅ Criação de agência
- ✅ Validação de CADASTUR duplicado
- ✅ Validação de CNPJ duplicado
- ✅ Listagem por tenant
- ✅ Busca por ID
- ✅ Atualização de agência
- ✅ Remoção de agência
- ✅ Tratamento de agência não encontrada

### Rodar Testes

```bash
# Todos os testes
npm test

# Testes específicos
npm test -- agencies.service.spec.ts
npm test -- agencies.controller.spec.ts
npm test -- agencies.e2e-spec.ts

# Com coverage
npm test -- --coverage
```

---

## 🚀 Como Usar

### 1. Configurar Ambiente

```bash
# Aplicar migrations
npm run db:push

# Iniciar servidor
npm run start:dev
```

### 2. Criar Agência (Superadmin)

```bash
curl -X POST http://localhost:3000/agencies/tenants/TENANT_ID/agencies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUPERADMIN_TOKEN" \
  -d '{
    "name": "Agência de Viagens ABC",
    "cadastur": "12.34567.89/0001-12",
    "cnpj": "12.345.678/0001-90",
    "description": "Agência especializada em turismo nacional"
  }'
```

### 3. Listar Agências (Superadmin)

```bash
curl http://localhost:3000/agencies/tenants/TENANT_ID/agencies \
  -H "Authorization: Bearer SUPERADMIN_TOKEN"
```

### 4. Visualizar Agência (Agency Admin)

```bash
curl http://localhost:3000/agencies/AGENCY_ID \
  -H "Authorization: Bearer AGENCY_ADMIN_TOKEN" \
  -H "X-Tenant-ID: tenant-slug"
```

### 5. Atualizar Agência (Agency Admin)

```bash
curl -X PATCH http://localhost:3000/agencies/AGENCY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer AGENCY_ADMIN_TOKEN" \
  -H "X-Tenant-ID: tenant-slug" \
  -d '{
    "name": "Agência Atualizada",
    "description": "Nova descrição"
  }'
```

### 6. Remover Agência (Superadmin)

```bash
curl -X DELETE http://localhost:3000/agencies/AGENCY_ID \
  -H "Authorization: Bearer SUPERADMIN_TOKEN"
```

---

## 📊 Validações Implementadas

### DTOs de Validação

**CreateAgencyDto:**

- `name`: String obrigatória, 2-100 caracteres
- `cadastur`: String obrigatória, formato XX.XXXXX.XX/XXXX-XX
- `cnpj`: String obrigatória, formato XX.XXX.XXX/XXXX-XX
- `description`: String opcional, máximo 500 caracteres

**UpdateAgencyDto:**

- Herda de CreateAgencyDto com todos os campos opcionais
- Validações aplicadas apenas aos campos fornecidos

### Validações de Negócio

**Unicidade:**

- CADASTUR deve ser único globalmente
- CNPJ deve ser único globalmente
- Verificação antes de criar/atualizar

**Tenant Ownership:**

- Agency admin só pode acessar agências do próprio tenant
- Superadmin pode acessar qualquer agência
- Validação automática via AuthorizationGuard

**Formato de Dados:**

- CADASTUR: Regex `/^\d{2}\.\d{5}\.\d{2}\/\d{4}-\d{2}$/`
- CNPJ: Regex `/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/`

---

## 🔧 Estrutura de Arquivos

```
src/
├── agencies/
│   ├── dto/
│   │   ├── create-agency.dto.ts
│   │   └── update-agency.dto.ts
│   ├── agencies.controller.ts
│   ├── agencies.controller.spec.ts
│   ├── agencies.service.ts
│   ├── agencies.service.spec.ts
│   ├── agencies.repository.ts
│   ├── agencies.module.ts
│   └── agencies.e2e-spec.ts
│
├── db/
│   ├── schema.ts (tabela agencies + relações)
│   └── migrations/
│       └── 0004_fancy_reavers.sql
│
└── app.module.ts (importa AgenciesModule)
```

---

## 📈 Próximos Passos

Com o sistema de agências implementado, agora você pode:

1. **Criar módulos relacionados** (excursões, reservas, etc.)
2. **Associar recursos às agências** (tenant → agencies → excursions)
3. **Implementar relatórios por agência**
4. **Adicionar funcionalidades específicas** (comissões, metas, etc.)
5. **Integrar com sistemas externos** (CADASTUR, Receita Federal)

---

## 🎯 Conformidade com História H1

| Critério                                   | Status | Implementação                   |
| ------------------------------------------ | ------ | ------------------------------- |
| Um tenant pode ter 1 ou mais agências      | ✅     | Relacionamento FK implementado  |
| Campos obrigatórios (nome, CADASTUR, CNPJ) | ✅     | Schema + validações DTO         |
| Campos opcionais (descrição, datas)        | ✅     | Schema + timestamps automáticos |
| CRUD completo                              | ✅     | 5 endpoints REST implementados  |
| Apenas SUPERADMIN cria/remove              | ✅     | Guards + decorators @Roles      |
| Herança de tenant_id                       | ✅     | FK + validação automática       |
| Validação de unicidade                     | ✅     | Constraints + verificações      |
| RBAC com tenant ownership                  | ✅     | AuthorizationGuard integrado    |
| Testes completos                           | ✅     | 31 testes (unit + e2e)          |
| Documentação Swagger                       | ✅     | @ApiTags + @ApiOperation        |

---

## 🐛 Troubleshooting

### Erro: "CADASTUR já está em uso"

- Verifique se o CADASTUR já existe no banco
- Use formato correto: XX.XXXXX.XX/XXXX-XX

### Erro: "CNPJ já está em uso"

- Verifique se o CNPJ já existe no banco
- Use formato correto: XX.XXX.XXX/XXXX-XX

### Erro: "Access denied. You can only access resources..."

- Agency admin tentando acessar agência de outro tenant
- Adicione header `X-Tenant-ID` correto
- Ou use subdomínio correto

### Erro: "Agência não encontrada neste tenant"

- Verifique se a agência existe
- Verifique se pertence ao tenant correto
- Use tenant ID correto na URL

### Migration não aplicada

```bash
# Aplicar migration
npm run db:push

# Verificar status
npm run db:studio
```

---

**Implementado por:** Sistema Multi-tenant NestJS  
**Data:** 2025-01-17  
**Versão:** 1.0.0
