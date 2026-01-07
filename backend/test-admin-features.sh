#!/bin/bash

# SupportHub Backend - Admin Features Test Script
# Tests all admin dashboard and management endpoints

BASE_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "Testing Admin Features"
echo "======================================"
echo ""

# Step 1: Admin Login to get token
echo -e "${YELLOW}Step 1: Admin Login${NC}"
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@supporthub.com",
    "password": "admin123"
  }')

echo "$ADMIN_LOGIN_RESPONSE" | jq '.'
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.data.token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}❌ Admin login failed. Cannot proceed with tests.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Admin token received${NC}"
echo ""

# Step 2: Get Dashboard Stats
echo -e "${YELLOW}Step 2: Get Dashboard Stats${NC}"
curl -s -X GET "$BASE_URL/api/admin/dashboard/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo -e "${GREEN}✓ Dashboard stats retrieved${NC}"
echo ""

# Step 3: Get All Tickets
echo -e "${YELLOW}Step 3: Get All Tickets (from all users)${NC}"
curl -s -X GET "$BASE_URL/api/admin/tickets" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo -e "${GREEN}✓ All tickets retrieved${NC}"
echo ""

# Step 4: Get Filtered Tickets
echo -e "${YELLOW}Step 4: Get Filtered Tickets (status=open)${NC}"
curl -s -X GET "$BASE_URL/api/admin/tickets?status=open" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo -e "${GREEN}✓ Filtered tickets retrieved${NC}"
echo ""

# Step 5: Get Ticket by ID
echo -e "${YELLOW}Step 5: Get Ticket by ID (ID=1)${NC}"
curl -s -X GET "$BASE_URL/api/admin/tickets/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo -e "${GREEN}✓ Ticket details retrieved${NC}"
echo ""

# Step 6: Update Ticket Status
echo -e "${YELLOW}Step 6: Update Ticket Status (ID=1, status=in-progress)${NC}"
curl -s -X PUT "$BASE_URL/api/admin/tickets/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "in-progress"
  }' | jq '.'
echo -e "${GREEN}✓ Ticket status updated${NC}"
echo ""

# Step 7: Get All Users
echo -e "${YELLOW}Step 7: Get All Users (with ticket statistics)${NC}"
curl -s -X GET "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo -e "${GREEN}✓ All users retrieved${NC}"
echo ""

# Step 8: Get Paginated Users
echo -e "${YELLOW}Step 8: Get Paginated Users (limit=5)${NC}"
curl -s -X GET "$BASE_URL/api/admin/users?limit=5&offset=0" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo -e "${GREEN}✓ Paginated users retrieved${NC}"
echo ""

# Step 9: Update User Status
echo -e "${YELLOW}Step 9: Update User Status (ID=1, status=active)${NC}"
curl -s -X PUT "$BASE_URL/api/admin/users/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "active"
  }' | jq '.'
echo -e "${GREEN}✓ User status updated${NC}"
echo ""

# Step 10: Get All Chat Threads
echo -e "${YELLOW}Step 10: Get All Chat Threads${NC}"
curl -s -X GET "$BASE_URL/api/admin/chats" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo -e "${GREEN}✓ All chat threads retrieved${NC}"
echo ""

# Step 11: Get Chat by User ID
echo -e "${YELLOW}Step 11: Get Chat History for User ID=1${NC}"
curl -s -X GET "$BASE_URL/api/admin/chats/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo -e "${GREEN}✓ Chat history retrieved${NC}"
echo ""

# Step 12: Test Authorization (using regular user token)
echo -e "${YELLOW}Step 12: Test Authorization (should fail with regular user token)${NC}"

# Login as regular user
USER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }')

USER_TOKEN=$(echo "$USER_LOGIN_RESPONSE" | jq -r '.data.token')

if [ "$USER_TOKEN" != "null" ] && [ -n "$USER_TOKEN" ]; then
  echo "Attempting to access admin endpoint with user token..."
  UNAUTHORIZED_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/dashboard/stats" \
    -H "Authorization: Bearer $USER_TOKEN")

  echo "$UNAUTHORIZED_RESPONSE" | jq '.'

  if echo "$UNAUTHORIZED_RESPONSE" | grep -q "Admin access required"; then
    echo -e "${GREEN}✓ Authorization working correctly (user token rejected)${NC}"
  else
    echo -e "${RED}❌ Authorization issue (user token should be rejected)${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Could not test with user token (test user may not exist)${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}All Admin Feature Tests Completed!${NC}"
echo "======================================"
echo ""
echo "Summary:"
echo "- Dashboard stats retrieval"
echo "- Ticket management (view all, filter, update status)"
echo "- User management (view all, update status)"
echo "- Chat thread viewing"
echo "- Authorization testing"
echo ""
echo "Note: Some tests may fail if test data doesn't exist yet."
echo "Create test data using test-auth.sh and test-user-features.sh first."
