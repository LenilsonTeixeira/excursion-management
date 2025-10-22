#!/bin/bash

# Script de teste para a API de Políticas de Cancelamento
# Este script testa os endpoints principais da API

BASE_URL="http://localhost:3000/api/v1"
AGENCY_ID="0793e55f-7f2d-4016-bb0c-d7a27eaa5313"  # Substitua pelo ID real da agência
TOKEN="your-jwt-token-here"  # Substitua pelo token JWT real

echo "🧪 Testando API de Políticas de Cancelamento"
echo "=============================================="

# Teste 1: Criar uma política de cancelamento
echo "📝 Teste 1: Criando política de cancelamento..."
curl -X POST \
  "$BASE_URL/agencies/$AGENCY_ID/cancellation-policies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }' \
  | jq '.'

echo -e "\n"

# Teste 2: Listar políticas da agência
echo "📋 Teste 2: Listando políticas da agência..."
curl -X GET \
  "$BASE_URL/agencies/$AGENCY_ID/cancellation-policies" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

echo -e "\n"

# Teste 3: Criar política padrão
echo "⭐ Teste 3: Criando política padrão..."
curl -X POST \
  "$BASE_URL/agencies/$AGENCY_ID/cancellation-policies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
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
  }' \
  | jq '.'

echo -e "\n"

# Teste 4: Buscar política padrão
echo "🔍 Teste 4: Buscando política padrão..."
curl -X GET \
  "$BASE_URL/agencies/$AGENCY_ID/cancellation-policies/default" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

echo -e "\n"

echo "✅ Testes concluídos!"
echo "💡 Para testar endpoints específicos, substitua POLICY_ID pelo ID retornado nos testes acima"
echo "📖 Consulte CANCELLATION-POLICIES-API.md para mais detalhes sobre a API"
