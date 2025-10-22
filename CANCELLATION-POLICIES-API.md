# Cancellation Policies API

Este documento descreve a API para gerenciamento de políticas de cancelamento de viagens.

## Visão Geral

As políticas de cancelamento permitem que as agências definam regras específicas para reembolso de viagens canceladas, baseadas no tempo de antecedência do cancelamento.

## Estrutura de Dados

### CancellationPolicy

```typescript
{
  id: string;           // UUID único da política
  name: string;         // Nome da política (ex: "Política Padrão")
  description?: string; // Descrição opcional
  isDefault: boolean;   // Define se é a política padrão da agência
  agencyId: string;     // ID da agência proprietária
  rules: CancellationPolicyRule[]; // Regras da política
  createdAt: Date;      // Data de criação
  updatedAt: Date;      // Data de última atualização
}
```

### CancellationPolicyRule

```typescript
{
  id: string; // UUID único da regra
  policyId: string; // ID da política pai
  daysBeforeTrip: number; // Dias antes da viagem
  refundPercentage: number; // Percentual de reembolso (0.0 a 1.0)
  displayOrder: number; // Ordem de exibição
  createdAt: Date; // Data de criação
  updatedAt: Date; // Data de última atualização
}
```

## Endpoints

### Base Path

```
/api/v1/agencies/{agencyId}/cancellation-policies
```

### 1. Criar Política de Cancelamento

**POST** `/api/v1/agencies/{agencyId}/cancellation-policies`

**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Request Body:**

```json
{
  "name": "Política Flexível",
  "description": "Reembolso de até 80% se cancelado com antecedência.",
  "isDefault": false,
  "rules": [
    {
      "daysBeforeTrip": 15,
      "refundPercentage": 0.8,
      "displayOrder": 1
    },
    {
      "daysBeforeTrip": 7,
      "refundPercentage": 0.5,
      "displayOrder": 2
    },
    {
      "daysBeforeTrip": 3,
      "refundPercentage": 0.2,
      "displayOrder": 3
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "id": "uuid",
  "name": "Política Flexível",
  "description": "Reembolso de até 80% se cancelado com antecedência.",
  "isDefault": false,
  "agencyId": "uuid",
  "rules": [
    {
      "id": "uuid",
      "daysBeforeTrip": 15,
      "refundPercentage": "0.8",
      "displayOrder": 1
    },
    {
      "id": "uuid",
      "daysBeforeTrip": 7,
      "refundPercentage": "0.5",
      "displayOrder": 2
    },
    {
      "id": "uuid",
      "daysBeforeTrip": 3,
      "refundPercentage": "0.2",
      "displayOrder": 3
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Listar Políticas da Agência

**GET** `/api/v1/agencies/{agencyId}/cancellation-policies`

**Headers:**

- `Authorization: Bearer {token}`

**Response (200 OK):**

```json
[
  {
    "id": "uuid",
    "name": "Política Padrão",
    "description": "Padrão de reembolso da agência",
    "isDefault": true,
    "agencyId": "uuid",
    "rules": [
      {
        "id": "uuid",
        "daysBeforeTrip": 10,
        "refundPercentage": "1.0",
        "displayOrder": 1
      },
      {
        "id": "uuid",
        "daysBeforeTrip": 5,
        "refundPercentage": "0.5",
        "displayOrder": 2
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "name": "Política Flexível",
    "description": "Reembolso de até 80% se cancelado com antecedência.",
    "isDefault": false,
    "agencyId": "uuid",
    "rules": [
      {
        "id": "uuid",
        "daysBeforeTrip": 15,
        "refundPercentage": "0.8",
        "displayOrder": 1
      },
      {
        "id": "uuid",
        "daysBeforeTrip": 7,
        "refundPercentage": "0.5",
        "displayOrder": 2
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 3. Buscar Política Padrão

**GET** `/api/v1/agencies/{agencyId}/cancellation-policies/default`

**Headers:**

- `Authorization: Bearer {token}`

**Response (200 OK):**

```json
{
  "id": "uuid",
  "name": "Política Padrão",
  "description": "Padrão de reembolso da agência",
  "isDefault": true,
  "agencyId": "uuid",
  "rules": [
    {
      "id": "uuid",
      "daysBeforeTrip": 10,
      "refundPercentage": "1.0",
      "displayOrder": 1
    },
    {
      "id": "uuid",
      "daysBeforeTrip": 5,
      "refundPercentage": "0.5",
      "displayOrder": 2
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Buscar Política Específica

**GET** `/api/v1/agencies/{agencyId}/cancellation-policies/{policyId}`

**Headers:**

- `Authorization: Bearer {token}`

**Response (200 OK):**

```json
{
  "id": "uuid",
  "name": "Política Flexível",
  "description": "Reembolso de até 80% se cancelado com antecedência.",
  "isDefault": false,
  "agencyId": "uuid",
  "rules": [
    {
      "id": "uuid",
      "daysBeforeTrip": 15,
      "refundPercentage": "0.8",
      "displayOrder": 1
    },
    {
      "id": "uuid",
      "daysBeforeTrip": 7,
      "refundPercentage": "0.5",
      "displayOrder": 2
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 5. Atualizar Política

**PUT** `/api/v1/agencies/{agencyId}/cancellation-policies/{policyId}`

**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Request Body:**

```json
{
  "name": "Política Flexível Atualizada",
  "description": "Nova regra com reembolso integral até 20 dias antes.",
  "isDefault": false,
  "rules": [
    {
      "daysBeforeTrip": 20,
      "refundPercentage": 1.0,
      "displayOrder": 1
    },
    {
      "daysBeforeTrip": 10,
      "refundPercentage": 0.7,
      "displayOrder": 2
    },
    {
      "daysBeforeTrip": 5,
      "refundPercentage": 0.3,
      "displayOrder": 3
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "name": "Política Flexível Atualizada",
  "description": "Nova regra com reembolso integral até 20 dias antes.",
  "isDefault": false,
  "agencyId": "uuid",
  "rules": [
    {
      "id": "uuid",
      "daysBeforeTrip": 20,
      "refundPercentage": "1.0",
      "displayOrder": 1
    },
    {
      "id": "uuid",
      "daysBeforeTrip": 10,
      "refundPercentage": "0.7",
      "displayOrder": 2
    },
    {
      "id": "uuid",
      "daysBeforeTrip": 5,
      "refundPercentage": "0.3",
      "displayOrder": 3
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 6. Deletar Política

**DELETE** `/api/v1/agencies/{agencyId}/cancellation-policies/{policyId}`

**Headers:**

- `Authorization: Bearer {token}`

**Response (204 No Content):**

```

```

## Regras de Negócio

### Validações

1. **Nome único**: Cada política deve ter um nome único dentro da agência
2. **Política padrão**: Apenas uma política pode ser marcada como padrão por agência
3. **Regras obrigatórias**: Cada política deve ter pelo menos uma regra
4. **Dias únicos**: Não pode haver regras duplicadas para o mesmo número de dias
5. **Ordem única**: Cada regra deve ter uma ordem de exibição única
6. **Percentual válido**: O percentual de reembolso deve estar entre 0 e 1
7. **Dias válidos**: Os dias antes da viagem devem ser maiores ou iguais a 0
8. **Lógica de reembolso**: As regras devem ter percentuais decrescentes conforme os dias diminuem

### Permissões

- **Superadmin**: Pode gerenciar políticas de qualquer agência
- **Agency Admin**: Pode gerenciar apenas políticas da própria agência
- **Agent/Customer**: Não têm acesso a esta API

## Códigos de Erro

- **400 Bad Request**: Dados inválidos ou regras de negócio violadas
- **401 Unauthorized**: Token de autenticação inválido ou ausente
- **403 Forbidden**: Usuário não tem permissão para acessar o recurso
- **404 Not Found**: Política não encontrada
- **409 Conflict**: Nome já em uso ou regras duplicadas

## Exemplos de Uso

### Criar Política Padrão

```bash
curl -X POST \
  http://localhost:3000/api/v1/agencies/123e4567-e89b-12d3-a456-426614174001/cancellation-policies \
  -H 'Authorization: Bearer your-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Política Padrão",
    "description": "Política padrão da agência",
    "isDefault": true,
    "rules": [
      {
        "daysBeforeTrip": 7,
        "refundPercentage": 1.0,
        "displayOrder": 1
      },
      {
        "daysBeforeTrip": 3,
        "refundPercentage": 0.5,
        "displayOrder": 2
      },
      {
        "daysBeforeTrip": 1,
        "refundPercentage": 0.0,
        "displayOrder": 3
      }
    ]
  }'
```

### Listar Políticas

```bash
curl -X GET \
  http://localhost:3000/api/v1/agencies/123e4567-e89b-12d3-a456-426614174001/cancellation-policies \
  -H 'Authorization: Bearer your-token'
```

### Buscar Política Padrão

```bash
curl -X GET \
  http://localhost:3000/api/v1/agencies/123e4567-e89b-12d3-a456-426614174001/cancellation-policies/default \
  -H 'Authorization: Bearer your-token'
```
