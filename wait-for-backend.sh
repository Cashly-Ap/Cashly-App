#!/bin/bash
# ============================================================================
# Wait for the backend API to be ready before starting the frontend
# ============================================================================

BACKEND_URL="${BACKEND_URL:-http://parsun-api-app:8080}"
MAX_RETRIES="${MAX_RETRIES:-60}"
RETRY_INTERVAL="${RETRY_INTERVAL:-5}"

echo "⏳ Waiting for backend at ${BACKEND_URL}..."

for i in $(seq 1 $MAX_RETRIES); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/actuator/health" 2>/dev/null || true)
  
  if [ "$HTTP_CODE" = "200" ]; then
    RESPONSE=$(curl -s "${BACKEND_URL}/actuator/health" 2>/dev/null || echo "")
    if echo "$RESPONSE" | grep -q '"status":"UP"'; then
      echo "✅ Backend is UP after ${i} attempts (${BACKEND_URL})"
      exec "$@"
      exit 0
    fi
  fi
  
  if [ $((i % 10)) -eq 0 ]; then
    echo "⏳ Still waiting for backend... (attempt ${i}/${MAX_RETRIES}, HTTP ${HTTP_CODE})"
  fi
  
  sleep $RETRY_INTERVAL
done

echo "❌ Backend did not become ready after ${MAX_RETRIES} attempts"
echo "   Last HTTP code: ${HTTP_CODE}"
echo "   Starting frontend anyway..."
exec "$@"
