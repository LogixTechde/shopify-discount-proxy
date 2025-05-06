# Shopify Rabattcode API

Diese kleine Node.js-API generiert Rabattcodes zur Nutzung in Shopify-Gewinnspielen (z. B. Minenfeld oder Glücksrad).

## Endpunkt

**GET** `/create?discount=10`  
Antwort:

```json
{
  "code": "LOGIX-10-XYZAB",
  "valid_until": "2025-06-06T00:00:00Z"
}
