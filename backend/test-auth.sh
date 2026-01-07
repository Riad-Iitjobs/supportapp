#!/bin/bash

# Test script for authentication endpoints
# Make this file executable: chmod +x test-auth.sh

echo "🧪 Testing SupportHub Authentication Endpoints"
echo "=============================================="
echo ""

BASE_URL="http://localhost:3000/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Testing Health Check${NC}"
echo "GET /health"
curl -s http://localhost:3000/health | json_pp
echo ""
echo ""

echo -e "${YELLOW}2. Testing User Signup${NC}"
echo "POST /api/auth/signup"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }')

echo "$SIGNUP_RESPONSE" | json_pp

# Extract token from signup response
USER_TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -n "$USER_TOKEN" ]; then
  echo -e "${GREEN}✅ Signup successful! Token received.${NC}"
else
  echo -e "${RED}❌ Signup failed!${NC}"
fi
echo ""
echo ""

echo -e "${YELLOW}3. Testing User Login${NC}"
echo "POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }')

echo "$LOGIN_RESPONSE" | json_pp

USER_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -n "$USER_TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful! Token received.${NC}"
  echo "User Token: $USER_TOKEN"
else
  echo -e "${RED}❌ Login failed!${NC}"
fi
echo ""
echo ""

echo -e "${YELLOW}4. Testing Admin Login${NC}"
echo "POST /api/auth/admin/login"
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@supporthub.com",
    "password": "admin123"
  }')

echo "$ADMIN_RESPONSE" | json_pp

ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✅ Admin login successful! Token received.${NC}"
  echo "Admin Token: $ADMIN_TOKEN"
else
  echo -e "${RED}❌ Admin login failed! Make sure you've updated the admin password hash.${NC}"
fi
echo ""
echo ""

echo -e "${YELLOW}5. Testing Token Refresh (if user token exists)${NC}"
if [ -n "$USER_TOKEN" ]; then
  echo "POST /api/auth/refresh"
  REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN")

  echo "$REFRESH_RESPONSE" | json_pp

  if echo "$REFRESH_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Token refresh successful!${NC}"
  else
    echo -e "${RED}❌ Token refresh failed!${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Skipping refresh test (no user token available)${NC}"
fi
echo ""
echo ""

echo -e "${YELLOW}6. Testing Invalid Credentials${NC}"
echo "POST /api/auth/login (with wrong password)"
INVALID_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }')

echo "$INVALID_RESPONSE" | json_pp

if echo "$INVALID_RESPONSE" | grep -q "INVALID_CREDENTIALS"; then
  echo -e "${GREEN}✅ Correctly rejected invalid credentials${NC}"
else
  echo -e "${RED}❌ Should have rejected invalid credentials!${NC}"
fi
echo ""
echo ""

echo "=============================================="
echo -e "${GREEN}✅ Authentication endpoint tests complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "   - Use Postman/Insomnia for more detailed testing"
echo "   - Save the tokens to test protected endpoints later"
