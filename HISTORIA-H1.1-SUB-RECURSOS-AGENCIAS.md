# História H1.1 — Sub-recursos de Agências

## Visão Geral

Esta história implementa os sub-recursos de agências (endereços, telefones, emails e redes sociais) com seus respectivos CRUDs, validações específicas e controle de acesso baseado em tenant ownership.

## Estrutura Implementada

### 1. Schemas de Banco de Dados

#### Tabela `agency_addresses`

- **Campos**: id, agency_id, type, street, number, complement, neighborhood, city, state, zip_code, country, is_main, created_at, updated_at
- **Tipos**: main, branch, warehouse
- **Validações**: CEP brasileiro, estado com 2 caracteres

#### Tabela `agency_phones`

- **Campos**: id, agency_id, type, number, country_code, is_main, created_at, updated_at
- **Tipos**: main, mobile, fax, whatsapp
- **Validações**: Formato brasileiro (XX) XXXXX-XXXX, código do país

#### Tabela `agency_emails`

- **Campos**: id, agency_id, type, email, is_main, created_at, updated_at
- **Tipos**: main, commercial, support, marketing
- **Validações**: Formato de email válido

#### Tabela `agency_socials`

- **Campos**: id, agency_id, platform, url, username, is_active, created_at, updated_at
- **Plataformas**: facebook, instagram, twitter, linkedin, youtube, tiktok
- **Validações**: URL válida, plataforma única por agência

### 2. DTOs com Validações Específicas

#### Endereços

- **CEP**: Formato XXXXX-XXX
- **Estado**: Exatamente 2 caracteres (UF)
- **Campos obrigatórios**: street, number, neighborhood, city, state, zipCode
- **Campos opcionais**: complement, country (default: Brasil)

#### Telefones

- **Número**: Formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
- **Código do país**: Formato +XXX (default: +55)
- **Validação de unicidade**: Número não pode ser duplicado

#### Emails

- **Formato**: Email válido com validação de domínio
- **Validação de unicidade**: Email não pode ser duplicado
- **Comprimento**: 5-100 caracteres

#### Redes Sociais

- **URL**: Formato de URL válido
- **Plataforma**: Enum com valores específicos
- **Validação de unicidade**: Uma plataforma por agência

### 3. Repositories

Cada sub-recurso possui seu próprio repository com métodos específicos:

#### Métodos Comuns

- `create()` - Criar novo registro
- `findAllByAgency()` - Listar por agência
- `findOne()` - Buscar por ID
- `findOneByAgency()` - Buscar por ID e agência
- `update()` - Atualizar registro
- `updateByAgency()` - Atualizar por agência
- `remove()` - Remover registro
- `removeByAgency()` - Remover por agência
- `countByAgency()` - Contar registros

#### Métodos Específicos

- **Endereços**: `findMainByAgency()`
- **Telefones**: `findByNumber()`, `findMainByAgency()`
- **Emails**: `findByEmail()`, `findMainByAgency()`
- **Redes Sociais**: `findByPlatformAndAgency()`, `findActiveByAgency()`

#### Validações de Ownership

- `validateAgencyOwnership()` - Verificar se pertence à agência
- `validateAgencyTenantOwnership()` - Verificar se pertence ao tenant

### 4. Services com Lógica de Negócio

#### Validações Implementadas

- **Existência da agência**: Verificar se agência existe antes de criar sub-recursos
- **Unicidade**: Telefones e emails únicos globalmente
- **Plataforma única**: Uma rede social por plataforma por agência
- **Recurso principal**: Apenas um registro principal por tipo por agência

#### Regras de Negócio

- **Auto-desmarcar principal**: Ao marcar novo registro como principal, desmarcar o anterior
- **Cascata de exclusão**: Exclusão da agência remove todos os sub-recursos
- **Validação de tenant**: Verificar se usuário pertence ao tenant da agência

### 5. Controllers com Endpoints REST Aninhados

#### Estrutura de Rotas

```
/agencies/:agencyId/addresses
/agencies/:agencyId/phones
/agencies/:agencyId/emails
/agencies/:agencyId/socials
```

#### Endpoints por Sub-recurso

##### Endereços

- `POST /agencies/:agencyId/addresses` - Criar endereço
- `GET /agencies/:agencyId/addresses` - Listar endereços
- `GET /agencies/:agencyId/addresses/:id` - Obter endereço
- `PATCH /agencies/:agencyId/addresses/:id` - Atualizar endereço
- `DELETE /agencies/:agencyId/addresses/:id` - Remover endereço
- `GET /agencies/:agencyId/addresses/main/current` - Endereço principal
- `GET /agencies/:agencyId/addresses/count/total` - Contar endereços

##### Telefones

- `POST /agencies/:agencyId/phones` - Criar telefone
- `GET /agencies/:agencyId/phones` - Listar telefones
- `GET /agencies/:agencyId/phones/:id` - Obter telefone
- `PATCH /agencies/:agencyId/phones/:id` - Atualizar telefone
- `DELETE /agencies/:agencyId/phones/:id` - Remover telefone
- `GET /agencies/:agencyId/phones/main/current` - Telefone principal
- `GET /agencies/:agencyId/phones/count/total` - Contar telefones

##### Emails

- `POST /agencies/:agencyId/emails` - Criar email
- `GET /agencies/:agencyId/emails` - Listar emails
- `GET /agencies/:agencyId/emails/:id` - Obter email
- `PATCH /agencies/:agencyId/emails/:id` - Atualizar email
- `DELETE /agencies/:agencyId/emails/:id` - Remover email
- `GET /agencies/:agencyId/emails/main/current` - Email principal
- `GET /agencies/:agencyId/emails/count/total` - Contar emails

##### Redes Sociais

- `POST /agencies/:agencyId/socials` - Criar rede social
- `GET /agencies/:agencyId/socials` - Listar redes sociais
- `GET /agencies/:agencyId/socials/active` - Listar ativas
- `GET /agencies/:agencyId/socials/:id` - Obter rede social
- `PATCH /agencies/:agencyId/socials/:id` - Atualizar rede social
- `DELETE /agencies/:agencyId/socials/:id` - Remover rede social
- `GET /agencies/:agencyId/socials/platform/:platform` - Por plataforma
- `GET /agencies/:agencyId/socials/count/total` - Contar redes sociais

### 6. Segurança e Autorização

#### Guards Implementados

- `JwtAuthGuard` - Autenticação JWT
- `RolesGuard` - Controle de roles
- `AgencyTenantGuard` - Validação de tenant ownership

#### Matriz de Autorização

| Ação                   | Superadmin | Agency Admin |
| ---------------------- | ---------- | ------------ |
| Criar sub-recursos     | ✅         | ❌           |
| Listar sub-recursos    | ✅         | ✅           |
| Obter sub-recurso      | ✅         | ✅           |
| Atualizar sub-recurso  | ✅         | ✅           |
| Remover sub-recurso    | ✅         | ❌           |
| Acessar outros tenants | ✅         | ❌           |

#### Validações de Segurança

- **Tenant ownership**: Usuário só pode acessar recursos do seu tenant
- **Agency ownership**: Agency admin só pode acessar recursos da sua agência
- **Contexto de agência**: Agency ID inferido da URL
- **Middleware de tenant**: Continua ativo para todas as rotas

### 7. Testes Implementados

#### Testes Unitários

- **Services**: Validações de negócio, tratamento de erros
- **Repositories**: Operações CRUD, validações de ownership
- **DTOs**: Validações de entrada, formatos específicos

#### Testes de Integração

- **Criação completa**: Agência + todos os sub-recursos
- **Conflitos de unicidade**: Telefones, emails, plataformas
- **Validações de ownership**: Tenant e agência
- **Operações CRUD**: Todas as operações por sub-recurso

#### Testes E2E

- **Fluxo completo**: Criação de agência + sub-recursos
- **Autorização**: Diferentes roles e tenants
- **Validações**: Dados inválidos e formatos incorretos
- **Segurança**: Acesso negado e validações de tenant

### 8. Migration e Banco de Dados

#### Migration: `0005_mature_prism.sql`

- Criação das 4 tabelas de sub-recursos
- Foreign keys para `agencies` com cascade delete
- Constraints de unicidade onde aplicável
- Valores padrão para campos opcionais

#### Relacionamentos

- **agencies** → **agency_addresses** (1:N)
- **agencies** → **agency_phones** (1:N)
- **agencies** → **agency_emails** (1:N)
- **agencies** → **agency_socials** (1:N)

### 9. Exemplos de Uso

#### Criar Agência com Sub-recursos

```bash
# 1. Criar agência
POST /tenants/tenant-123/agencies
{
  "name": "Agência de Viagens",
  "cadastur": "26.00000.10/0001-00",
  "cnpj": "00.000.000/0001-00",
  "description": "Agência especializada em ecoturismo"
}

# 2. Criar endereço principal
POST /agencies/agency-456/addresses
{
  "type": "main",
  "street": "Rua das Flores",
  "number": "123",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "isMain": true
}

# 3. Criar telefone principal
POST /agencies/agency-456/phones
{
  "type": "main",
  "number": "(11) 99999-9999",
  "countryCode": "+55",
  "isMain": true
}

# 4. Criar email principal
POST /agencies/agency-456/emails
{
  "type": "main",
  "email": "contato@agencia.com",
  "isMain": true
}

# 5. Criar rede social
POST /agencies/agency-456/socials
{
  "platform": "facebook",
  "url": "https://facebook.com/agencia123",
  "username": "agencia123",
  "isActive": true
}
```

#### Listar Sub-recursos

```bash
# Listar todos os endereços
GET /agencies/agency-456/addresses

# Obter endereço principal
GET /agencies/agency-456/addresses/main/current

# Contar telefones
GET /agencies/agency-456/phones/count/total

# Listar redes sociais ativas
GET /agencies/agency-456/socials/active
```

### 10. Validações Específicas

#### CNPJ e CADASTUR

- **CNPJ**: Formato XX.XXX.XXX/XXXX-XX
- **CADASTUR**: Formato XX.XXXXX.XX/XXXX-XX
- **Unicidade**: Ambos únicos globalmente

#### Máscaras de Telefone

- **Fixo**: (XX) XXXX-XXXX
- **Celular**: (XX) XXXXX-XXXX
- **Internacional**: +XXX (XX) XXXXX-XXXX

#### Emails Válidos

- **Formato**: user@domain.com
- **Validação**: Regex + validação de domínio
- **Comprimento**: 5-100 caracteres

### 11. Tratamento de Erros

#### Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Dados inválidos
- **401**: Não autorizado
- **403**: Acesso negado
- **404**: Recurso não encontrado
- **409**: Conflito (duplicação)

#### Mensagens de Erro

- **Validação**: Detalhes específicos do campo inválido
- **Autorização**: "Acesso negado: tenant não autorizado"
- **Conflito**: "Número de telefone já está em uso"
- **Não encontrado**: "Agência não encontrada"

### 12. Performance e Otimizações

#### Índices de Banco

- **Primary keys**: UUIDs com índice automático
- **Foreign keys**: agency_id em todas as tabelas
- **Unicidade**: Índices únicos para campos únicos

#### Queries Otimizadas

- **Joins**: Apenas quando necessário para validações
- **Limits**: Aplicados em buscas por ID
- **Ordering**: Por data de criação por padrão

### 13. Monitoramento e Logs

#### Logs de Auditoria

- **Criação**: Log de novos sub-recursos
- **Atualização**: Log de mudanças
- **Exclusão**: Log de remoções
- **Acesso**: Log de tentativas de acesso

#### Métricas

- **Contagem**: Número de sub-recursos por agência
- **Uso**: Frequência de acesso por tipo
- **Erros**: Taxa de validação e autorização

## Conclusão

A implementação dos sub-recursos de agências fornece uma base sólida para o gerenciamento completo de informações de contato e localização das agências, com validações específicas, controle de acesso robusto e testes abrangentes. O sistema mantém a integridade dos dados através de validações de unicidade e ownership, garantindo que cada agência tenha informações completas e organizadas.
