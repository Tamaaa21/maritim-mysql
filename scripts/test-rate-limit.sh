#!/bin/bash

# Rate Limiting Test Script
# Usage: ./scripts/test-rate-limit.sh [base_url]
# Default base_url: http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"
LOGIN_ENDPOINT="$BASE_URL/api/admin/login"
MAX_ATTEMPTS=5
EXPECTED_429_AT=$((MAX_ATTEMPTS + 1))

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "  Rate Limiting Test — Login Endpoint"
echo "========================================="
echo "Target: $LOGIN_ENDPOINT"
echo "Max attempts: $MAX_ATTEMPTS"
echo ""

# Test 1: Login attempts within limit
echo -e "${YELLOW}Test 1: Sending $MAX_ATTEMPTS login attempts (should NOT be 429)${NC}"
PASS=0
FAIL=0
for i in $(seq 1 $MAX_ATTEMPTS); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$LOGIN_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrongpassword"}')

  if [ "$HTTP_CODE" = "429" ]; then
    echo -e "  Attempt $i: ${RED}HTTP $HTTP_CODE (unexpected 429)${NC}"
    FAIL=$((FAIL + 1))
  else
    echo -e "  Attempt $i: ${GREEN}HTTP $HTTP_CODE (OK — not rate limited)${NC}"
    PASS=$((PASS + 1))
  fi
done
echo ""

# Test 2: Should get 429 after exceeding limit
echo -e "${YELLOW}Test 2: Sending attempt #$EXPECTED_429_AT (should be 429)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$LOGIN_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpassword"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "429" ]; then
  echo -e "  Attempt $EXPECTED_429_AT: ${GREEN}HTTP $HTTP_CODE (correctly rate limited)${NC}"
  echo "  Response: $BODY"
  PASS=$((PASS + 1))
else
  echo -e "  Attempt $EXPECTED_429_AT: ${RED}HTTP $HTTP_CODE (expected 429)${NC}"
  FAIL=$((FAIL + 1))
fi
echo ""

# Test 3: Check response headers
echo -e "${YELLOW}Test 3: Checking rate limit response headers${NC}"
HEADERS=$(curl -s -D - -o /dev/null \
  -X POST "$LOGIN_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpassword"}' 2>&1)

if echo "$HEADERS" | grep -qi "X-RateLimit-Limit"; then
  echo -e "  ${GREEN}X-RateLimit-Limit header present${NC}"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}X-RateLimit-Limit header missing${NC}"
  FAIL=$((FAIL + 1))
fi

if echo "$HEADERS" | grep -qi "Retry-After"; then
  echo -e "  ${GREEN}Retry-After header present${NC}"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}Retry-After header missing${NC}"
  FAIL=$((FAIL + 1))
fi
echo ""

# Summary
echo "========================================="
TOTAL=$((PASS + FAIL))
if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}Result: $PASS/$TOTAL tests passed — ALL OK${NC}"
else
  echo -e "${RED}Result: $FAIL/$TOTAL tests failed${NC}"
fi
echo "========================================="
