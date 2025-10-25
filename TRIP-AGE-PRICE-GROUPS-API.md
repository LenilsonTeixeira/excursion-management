# API de Grupos de Preço por Faixa Etária

Esta API permite gerenciar grupos de preço baseados em faixas etárias para viagens.

## Estrutura de Dados

### TripAgePriceGroup

```typescript
{
  id: string;                    // UUID do grupo de preço
  tripId: string;                // UUID da viagem
  ageRangeId: string;            // UUID da faixa etária
  finalPrice: number;            // Preço final de venda (Ex: 199.99)
  originalPrice?: number;        // Preço original opcional para exibir desconto (Ex: 250.00)
  displayOrder: number;          // Ordem de exibição (1 = Adulto, 2 = Criança, etc.)
  description?: string;          // Descrição adicional do grupo
  isActive: boolean;             // Define se o grupo está ativo
  createdAt: Date;
  updatedAt: Date;
  ageRange?: {                   // Dados da faixa etária relacionada
    id: string;
    name: string;
    minAge: number;
    maxAge: number;
    occupiesSeat: boolean;
  };
}
```

## Endpoints

Todos os endpoints seguem o padrão `/agencies/{agencyId}/trips/{tripId}/price-groups` como base.

### 1. Criar Grupo de Preço

**POST** `/agencies/{agencyId}/trips/{tripId}/price-groups`

Cria um novo grupo de preço para a viagem especificada.

#### Parâmetros de Path

- `agencyId` (UUID) - ID da agência
- `tripId` (UUID) - ID da viagem

#### Body

```json
{
  "ageRangeId": "123e4567-e89b-12d3-a456-426614174000",
  "finalPrice": 199.99,
  "originalPrice": 250.0,
  "displayOrder": 1,
  "description": "Válido para adultos",
  "isActive": true
}
```

#### Campos Obrigatórios

- `ageRangeId` - ID da faixa etária
- `finalPrice` - Preço final (deve ser maior que 0)
- `displayOrder` - Ordem de exibição (deve ser maior que 0)

#### Campos Opcionais

- `originalPrice` - Preço original (se fornecido, deve ser maior que finalPrice)
- `description` - Descrição adicional (máx. 500 caracteres)
- `isActive` - Status ativo (padrão: true)

#### Respostas

- `201 Created` - Grupo de preço criado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autorizado
- `403 Forbidden` - Acesso negado
- `404 Not Found` - Viagem não encontrada

---

### 2. Listar Grupos de Preço da Viagem

**GET** `/agencies/{agencyId}/trips/{tripId}/price-groups`

Lista todos os grupos de preço de uma viagem, ordenados por `displayOrder`.

#### Parâmetros de Path

- `agencyId` (UUID) - ID da agência
- `tripId` (UUID) - ID da viagem

#### Respostas

- `200 OK` - Lista retornada com sucesso
- `401 Unauthorized` - Não autorizado
- `403 Forbidden` - Acesso negado

#### Exemplo de Resposta

```json
[
  {
    "id": "abc123...",
    "tripId": "trip123...",
    "ageRangeId": "age123...",
    "finalPrice": "199.99",
    "originalPrice": "250.00",
    "displayOrder": 1,
    "description": "Adulto",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "ageRange": {
      "id": "age123...",
      "name": "Adulto",
      "minAge": 18,
      "maxAge": 99,
      "occupiesSeat": true
    }
  },
  {
    "id": "def456...",
    "tripId": "trip123...",
    "ageRangeId": "age456...",
    "finalPrice": "99.99",
    "originalPrice": null,
    "displayOrder": 2,
    "description": "Criança",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "ageRange": {
      "id": "age456...",
      "name": "Criança",
      "minAge": 0,
      "maxAge": 12,
      "occupiesSeat": true
    }
  }
]
```

---

### 3. Obter Grupo de Preço Específico

**GET** `/agencies/{agencyId}/trips/{tripId}/price-groups/{priceGroupId}`

Retorna os detalhes de um grupo de preço específico.

#### Parâmetros de Path

- `agencyId` (UUID) - ID da agência
- `tripId` (UUID) - ID da viagem
- `priceGroupId` (UUID) - ID do grupo de preço

#### Respostas

- `200 OK` - Grupo de preço retornado com sucesso
- `401 Unauthorized` - Não autorizado
- `403 Forbidden` - Acesso negado
- `404 Not Found` - Grupo de preço não encontrado

---

### 4. Atualizar Grupo de Preço

**PATCH** `/agencies/{agencyId}/trips/{tripId}/price-groups/{priceGroupId}`

Atualiza um grupo de preço específico.

#### Parâmetros de Path

- `agencyId` (UUID) - ID da agência
- `tripId` (UUID) - ID da viagem
- `priceGroupId` (UUID) - ID do grupo de preço

#### Body

Todos os campos são opcionais. **Nota**: `ageRangeId` não pode ser alterado após a criação.

```json
{
  "finalPrice": 179.99,
  "originalPrice": 250.0,
  "displayOrder": 2,
  "description": "Preço promocional para adultos",
  "isActive": false
}
```

#### Validações

- Se `originalPrice` for fornecido, deve ser maior que `finalPrice` (atual ou atualizado)
- `displayOrder` deve ser maior que 0
- `finalPrice` deve ser maior que 0

#### Respostas

- `200 OK` - Grupo de preço atualizado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autorizado
- `403 Forbidden` - Acesso negado
- `404 Not Found` - Grupo de preço não encontrado

---

### 5. Remover Grupo de Preço

**DELETE** `/agencies/{agencyId}/trips/{tripId}/price-groups/{priceGroupId}`

Remove um grupo de preço de uma viagem.

#### Parâmetros de Path

- `agencyId` (UUID) - ID da agência
- `tripId` (UUID) - ID da viagem
- `priceGroupId` (UUID) - ID do grupo de preço

#### Respostas

- `204 No Content` - Grupo de preço removido com sucesso
- `401 Unauthorized` - Não autorizado
- `403 Forbidden` - Acesso negado
- `404 Not Found` - Grupo de preço não encontrado

---

## Permissões

### Criar, Atualizar e Remover

- `superadmin` - Acesso total
- `agency_admin` - Apenas viagens da própria agência

### Listar e Visualizar

- `superadmin` - Acesso total
- `agency_admin` - Apenas viagens da própria agência
- `agent` - Apenas viagens da própria agência (somente leitura)

---

## Casos de Uso

### 1. Configurar Preços para uma Viagem Nova

```javascript
// 1. Criar preço para adultos
POST /agencies/agency-123/trips/trip-456/price-groups
{
  "ageRangeId": "age-adult",
  "finalPrice": 299.99,
  "originalPrice": 350.00,
  "displayOrder": 1,
  "description": "Adulto (18 a 99 anos)"
}

// 2. Criar preço para crianças
POST /agencies/agency-123/trips/trip-456/price-groups
{
  "ageRangeId": "age-child",
  "finalPrice": 149.99,
  "displayOrder": 2,
  "description": "Criança (0 a 12 anos)"
}

// 3. Criar preço para idosos
POST /agencies/agency-123/trips/trip-456/price-groups
{
  "ageRangeId": "age-senior",
  "finalPrice": 249.99,
  "originalPrice": 300.00,
  "displayOrder": 3,
  "description": "Terceira Idade (60+ anos)"
}
```

### 2. Atualizar Preços em Promoção

```javascript
PATCH /agencies/agency-123/trips/trip-456/price-groups/price-group-789
{
  "finalPrice": 249.99,
  "originalPrice": 350.00,
  "description": "PROMOÇÃO: Adulto com 30% de desconto"
}
```

### 3. Desativar uma Faixa de Preço Temporariamente

```javascript
PATCH /agencies/agency-123/trips/trip-456/price-groups/price-group-789
{
  "isActive": false
}
```

### 4. Reordenar Exibição

```javascript
// Trocar a ordem de exibição
PATCH /agencies/agency-123/trips/trip-456/price-groups/child-price-id
{ "displayOrder": 1 }

PATCH /agencies/agency-123/trips/trip-456/price-groups/adult-price-id
{ "displayOrder": 2 }
```

---

## Regras de Negócio

1. **Preço Original vs Final**: Se `originalPrice` for fornecido, deve ser sempre maior que `finalPrice`
2. **Faixa Etária Única**: Não é possível ter dois grupos de preço com a mesma faixa etária para a mesma viagem
3. **Ordem de Exibição**: O `displayOrder` controla como os preços são exibidos na interface
4. **Desativação**: Grupos inativos (`isActive: false`) não devem ser exibidos para clientes, mas permanecem no sistema
5. **Deleção em Cascata**: Se uma viagem for deletada, todos os grupos de preço associados também serão deletados
6. **Restrição de Faixa Etária**: Se uma faixa etária for deletada, os grupos de preço associados não permitirão a deleção (restrict)

---

## Testes

Os testes unitários foram criados para:

- **Controller**: `trip-age-price-groups.controller.spec.ts`
- **Service**: `trip-age-price-groups.service.spec.ts`

Execute os testes com:

```bash
npm test
```

---

## Migração de Banco de Dados

A migração `0007_small_rick_jones.sql` foi criada e aplicada, adicionando a tabela `trip_age_price_groups` com:

- Chave primária UUID
- Foreign keys para `trips` (cascade delete) e `age_ranges` (restrict delete)
- Campos para preços (decimal 10,2)
- Campos de controle (displayOrder, isActive)
- Timestamps (createdAt, updatedAt)

---

## Próximos Passos

1. Implementar validação para evitar duplicação de faixas etárias na mesma viagem
2. Adicionar endpoint para reordenação em lote dos grupos de preço
3. Implementar histórico de alterações de preços
4. Adicionar suporte para preços dinâmicos baseados em datas
