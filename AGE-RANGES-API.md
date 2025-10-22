# Age Ranges API

Esta documentação descreve os endpoints da API para gerenciamento de faixas etárias (Age Ranges) no sistema de gestão de excursões.

## Visão Geral

As faixas etárias são utilizadas para precificação diferenciada baseada na idade dos passageiros. Cada agência pode definir suas próprias faixas etárias com diferentes critérios de idade e configurações de ocupação de assento.

## Estrutura de Dados

### AgeRange

```typescript
interface AgeRange {
  id: string; // UUID único da faixa etária
  name: string; // Nome da faixa etária (ex: "Adulto", "Criança", "Bebê de Colo")
  minAge: number; // Idade mínima da faixa
  maxAge: number; // Idade máxima da faixa
  occupiesSeat: boolean; // Se a faixa etária ocupa assento
  agencyId: string; // ID da agência proprietária
  createdAt: Date; // Data de criação
  updatedAt: Date; // Data da última atualização
}
```

### CreateAgeRangeDto

```typescript
interface CreateAgeRangeDto {
  name: string; // Nome da faixa etária (obrigatório, máx 100 caracteres)
  minAge: number; // Idade mínima (obrigatório, 0-120)
  maxAge: number; // Idade máxima (obrigatório, 0-120)
  occupiesSeat: boolean; // Se ocupa assento (obrigatório)
}
```

### UpdateAgeRangeDto

```typescript
interface UpdateAgeRangeDto {
  name?: string; // Nome da faixa etária (opcional)
  minAge?: number; // Idade mínima (opcional)
  maxAge?: number; // Idade máxima (opcional)
  occupiesSeat?: boolean; // Se ocupa assento (opcional)
}
```

## Endpoints

### Base URL

Todos os endpoints seguem o padrão:

```
/agencies/{agencyId}/age-ranges
```

### Autenticação

Todos os endpoints requerem autenticação JWT via header:

```
Authorization: Bearer <token>
```

### Autorização

- **superadmin**: Pode acessar faixas etárias de qualquer agência
- **agency_admin**: Pode acessar apenas faixas etárias da própria agência

---

## 1. Criar Faixa Etária

**POST** `/agencies/{agencyId}/age-ranges`

### Descrição

Cria uma nova faixa etária vinculada à agência especificada.

### Parâmetros de URL

- `agencyId` (string, UUID): ID da agência

### Body

```json
{
  "name": "Adulto",
  "minAge": 18,
  "maxAge": 65,
  "occupiesSeat": true
}
```

### Respostas

#### 201 - Criado com Sucesso

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Adulto",
  "minAge": 18,
  "maxAge": 65,
  "occupiesSeat": true,
  "agencyId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 400 - Dados Inválidos

```json
{
  "statusCode": 400,
  "message": "A idade mínima deve ser menor que a idade máxima",
  "error": "Bad Request"
}
```

#### 409 - Conflito

```json
{
  "statusCode": 409,
  "message": "Nome da faixa etária já está em uso nesta agência",
  "error": "Conflict"
}
```

ou

```json
{
  "statusCode": 409,
  "message": "A faixa etária sobrepõe com a faixa \"Criança\" (5-12 anos)",
  "error": "Conflict"
}
```

---

## 2. Listar Faixas Etárias

**GET** `/agencies/{agencyId}/age-ranges`

### Descrição

Lista todas as faixas etárias de uma agência específica.

### Parâmetros de URL

- `agencyId` (string, UUID): ID da agência

### Respostas

#### 200 - Sucesso

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Bebê de Colo",
    "minAge": 0,
    "maxAge": 2,
    "occupiesSeat": false,
    "agencyId": "123e4567-e89b-12d3-a456-426614174001",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "123e4567-e89b-12d3-a456-426614174002",
    "name": "Criança",
    "minAge": 3,
    "maxAge": 12,
    "occupiesSeat": true,
    "agencyId": "123e4567-e89b-12d3-a456-426614174001",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "123e4567-e89b-12d3-a456-426614174003",
    "name": "Adulto",
    "minAge": 13,
    "maxAge": 65,
    "occupiesSeat": true,
    "agencyId": "123e4567-e89b-12d3-a456-426614174001",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## 3. Detalhar Faixa Etária

**GET** `/agencies/{agencyId}/age-ranges/{ageRangeId}`

### Descrição

Retorna os detalhes de uma faixa etária específica.

### Parâmetros de URL

- `agencyId` (string, UUID): ID da agência
- `ageRangeId` (string, UUID): ID da faixa etária

### Respostas

#### 200 - Sucesso

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Adulto",
  "minAge": 18,
  "maxAge": 65,
  "occupiesSeat": true,
  "agencyId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 404 - Não Encontrado

```json
{
  "statusCode": 404,
  "message": "Faixa etária não encontrada",
  "error": "Not Found"
}
```

---

## 4. Atualizar Faixa Etária

**PATCH** `/agencies/{agencyId}/age-ranges/{ageRangeId}`

### Descrição

Atualiza os dados de uma faixa etária.

### Parâmetros de URL

- `agencyId` (string, UUID): ID da agência
- `ageRangeId` (string, UUID): ID da faixa etária

### Body

```json
{
  "name": "Adulto Atualizado",
  "minAge": 18,
  "maxAge": 70
}
```

### Respostas

#### 200 - Sucesso

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Adulto Atualizado",
  "minAge": 18,
  "maxAge": 70,
  "occupiesSeat": true,
  "agencyId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### 400 - Dados Inválidos

```json
{
  "statusCode": 400,
  "message": "A idade mínima deve ser menor que a idade máxima",
  "error": "Bad Request"
}
```

#### 409 - Conflito

```json
{
  "statusCode": 409,
  "message": "Nome da faixa etária já está em uso nesta agência",
  "error": "Conflict"
}
```

---

## 5. Remover Faixa Etária

**DELETE** `/agencies/{agencyId}/age-ranges/{ageRangeId}`

### Descrição

Remove uma faixa etária.

### Parâmetros de URL

- `agencyId` (string, UUID): ID da agência
- `ageRangeId` (string, UUID): ID da faixa etária

### Respostas

#### 204 - Removido com Sucesso

Sem conteúdo na resposta.

#### 404 - Não Encontrado

```json
{
  "statusCode": 404,
  "message": "Faixa etária não encontrada",
  "error": "Not Found"
}
```

---

## Regras de Negócio

### Validações

1. **Idade**: A idade mínima deve ser menor que a idade máxima
2. **Nome único**: O nome da faixa etária deve ser único dentro da agência
3. **Sobreposição**: Não é permitido criar faixas etárias que se sobreponham
4. **Idade válida**: As idades devem estar entre 0 e 120 anos

### Exemplos de Faixas Etárias Válidas

```json
[
  {
    "name": "Bebê de Colo",
    "minAge": 0,
    "maxAge": 2,
    "occupiesSeat": false
  },
  {
    "name": "Criança",
    "minAge": 3,
    "maxAge": 12,
    "occupiesSeat": true
  },
  {
    "name": "Adolescente",
    "minAge": 13,
    "maxAge": 17,
    "occupiesSeat": true
  },
  {
    "name": "Adulto",
    "minAge": 18,
    "maxAge": 65,
    "occupiesSeat": true
  },
  {
    "name": "Idoso",
    "minAge": 66,
    "maxAge": 120,
    "occupiesSeat": true
  }
]
```

### Códigos de Erro Comuns

- **400**: Dados inválidos (idade mínima >= idade máxima)
- **401**: Token de autenticação inválido ou expirado
- **403**: Usuário não tem permissão para acessar a agência
- **404**: Faixa etária não encontrada
- **409**: Conflito (nome duplicado ou sobreposição de faixas)

---

## Integração com Outros Módulos

As faixas etárias são utilizadas pelos seguintes módulos:

- **Pricing**: Para definir preços diferenciados por faixa etária
- **Bookings**: Para categorizar passageiros por idade
- **Reports**: Para relatórios de ocupação por faixa etária
- **Inventory**: Para controle de assentos ocupados vs. não ocupados
