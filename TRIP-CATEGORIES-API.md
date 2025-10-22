# Trip Categories API - Exemplos de Uso

Este documento demonstra como usar as APIs de categorias de viagem seguindo o padrão estabelecido no projeto.

## Endpoints Disponíveis

### 1. Criar Categoria de Viagem

```http
POST /agencies/{agencyId}/trip-categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Bate e Volta"
}
```

### 2. Listar Categorias da Agência

```http
GET /agencies/{agencyId}/trip-categories
Authorization: Bearer {token}
```

### 3. Buscar Categoria Específica

```http
GET /agencies/{agencyId}/trip-categories/{tripCategoryId}
Authorization: Bearer {token}
```

### 4. Atualizar Categoria

```http
PUT /agencies/{agencyId}/trip-categories/{tripCategoryId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Viagem com Hospedagem"
}
```

### 5. Deletar Categoria

```http
DELETE /agencies/{agencyId}/trip-categories/{tripCategoryId}
Authorization: Bearer {token}
```

## Exemplos de Resposta

### Criação/Atualização Bem-sucedida

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Bate e Volta",
  "agencyId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Lista de Categorias

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Bate e Volta",
    "agencyId": "123e4567-e89b-12d3-a456-426614174001",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "123e4567-e89b-12d3-a456-426614174002",
    "name": "Viagem com Hospedagem",
    "agencyId": "123e4567-e89b-12d3-a456-426614174001",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
]
```

## Regras de Negócio

1. **Autorização**:
   - `superadmin`: Pode criar, listar, buscar, atualizar e deletar categorias de qualquer agência
   - `agency_admin`: Pode gerenciar categorias apenas da própria agência

2. **Validações**:
   - Nome da categoria é obrigatório
   - Nome deve ter no máximo 100 caracteres
   - Nome deve ser único dentro da mesma agência
   - Agência deve existir

3. **Relacionamentos**:
   - Cada categoria pertence a uma agência específica
   - Ao deletar uma agência, todas suas categorias são deletadas automaticamente (CASCADE)

## Códigos de Status HTTP

- `201`: Categoria criada com sucesso
- `200`: Operação realizada com sucesso
- `204`: Categoria deletada com sucesso
- `400`: Dados inválidos
- `401`: Não autorizado
- `403`: Acesso negado
- `404`: Categoria não encontrada
- `409`: Nome da categoria já em uso nesta agência
