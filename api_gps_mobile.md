# Integração API: Rastreamento GPS (App Mobile)

Este documento descreve detalhadamente como o aplicativo Mobile (React Native) da UMS deve enviar as coordenadas geográficas capturadas ao longo do dia da eleição para o sistema backend Laravel.

## Informações do Endpoint

- **URL:** `/gps/posicao`
- **Método HTTP:** `POST`

## Headers Padrão
Para garantir o recebimento adequado e a resposta em formato JSON:
- `Content-Type: application/json`
- `Accept: application/json`


## Estrutura do Payload (JSON)

O endpoint foi arquitetado com a capacidade de processamento em **lotes (batch inserts)**.
O objetivo disso é garantir pleno suprimento offline: **se o tablet ficar sem sinal 3G/Wi-Fi, o React Native deve enfileirar as localizações no armazenamento local do dispositivo e disparar o array inteiro numa única chamada POST assim que a rede retornar.**

```json
{
  "patrimonio_tablet": "TREAC-12345",
  "rota_id": 12,
  "posicoes": [
    {
      "latitude": -9.97499000,
      "longitude": -67.80741000,
      "timestamp": "2026-03-24T14:30:00Z"
    },
    {
      "latitude": -9.97512000,
      "longitude": -67.80800000,
      "timestamp": "2026-03-24T14:30:30Z"
    }
  ]
}
```

### Detalhamento dos Campos

| Campo | Tipo | Obrigatoriedade | Descrição |
| --- | --- | --- | --- |
| `patrimonio_tablet` | String | **Obrigatório** | Identificador físico exclusivo do hardware utilizado em campo (ex: matrícula do patrimônio). |
| `rota_id` | Integer | Opcional | ID da rota alocada, caso aplicável. Enviar `null` caso a equipe/motorista se encontre temporariamente fora da base de rotas. |
| `posicoes` | Array | **Obrigatório** | Array englobando todos os pontos não-sincronizados. |
| `posicoes[].latitude` | Decimal / Float | **Obrigatório** | Coodenada latitudinal capturada. |
| `posicoes[].longitude`| Decimal / Float | **Obrigatório** | Coodenada longitudinal capturada. |
| `posicoes[].timestamp`| String (ISO 8601)| **Obrigatório** | Momento literal (data/hora exata) de quando a coordenada foi tirada pelo hardware do tablet, e não a hora do envio do payload pro servidor. O backend irá realizar o parse via `Carbon`. |

## Respostas Esperadas

### ✅ Sucesso (HTTP 200 OK)
Retornado tão logo o lote completo é salvo com sucesso em banco de dados:
```json
{
  "success": true,
  "message": "Posições salvas com sucesso."
}
```

### ❌ Erro de Validação (HTTP 422 Unprocessable Content)
Retornado caso campos essenciais não sejam enviados na malha JSON:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "posicoes.0.timestamp": ["The timestamp field is required."]
  }
}
```
