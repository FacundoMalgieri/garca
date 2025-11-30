#!/bin/bash

# Test rate limiting locally
# Usage: ./scripts/test-rate-limit.sh

URL="http://localhost:3000/api/arca/companies"
REQUESTS=35  # Limit is 30/min

echo "🔄 Testing rate limiting with $REQUESTS requests..."
echo "   (Limit is 30 requests per minute)"
echo ""

for i in $(seq 1 $REQUESTS); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d '{"cuit":"test","password":"test"}')
  
  if [ "$STATUS" = "429" ]; then
    echo "Request $i: ❌ 429 Too Many Requests (RATE LIMITED!)"
  elif [ "$STATUS" = "403" ]; then
    echo "Request $i: ⚠️  403 Forbidden (Turnstile/Bot check)"
  else
    echo "Request $i: ✅ $STATUS"
  fi
done

echo ""
echo "✅ Test complete!"

