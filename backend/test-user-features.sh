#!/bin/bash

# Test script for User Features (Phase 3)
# Make this file executable: chmod +x test-user-features.sh

echo "🧪 Testing SupportHub User Features (Phase 3)"
echo "=============================================="
echo ""

BASE_URL="http://localhost:3000/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Prerequisites: You need a valid user token${NC}"
echo "Run: ./test-auth.sh first to get a token"
echo ""
read -p "Enter your user token: " USER_TOKEN
echo ""

if [ -z "$USER_TOKEN" ]; then
  echo -e "${RED}❌ Token is required!${NC}"
  exit 1
fi

echo "=============================================="
echo ""

# Test 1: Get User Profile
echo -e "${YELLOW}1. Get User Profile${NC}"
echo "GET /api/user/profile"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/user/profile" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "$PROFILE_RESPONSE" | json_pp

if echo "$PROFILE_RESPONSE" | grep -q "email"; then
  echo -e "${GREEN}✅ Profile retrieved successfully!${NC}"
else
  echo -e "${RED}❌ Failed to get profile${NC}"
fi
echo ""
echo ""

# Test 2: Create Ticket
echo -e "${YELLOW}2. Create Ticket${NC}"
echo "POST /api/tickets"
TICKET_RESPONSE=$(curl -s -X POST "$BASE_URL/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "subject": "Test ticket from API",
    "category": "technical",
    "priority": "medium",
    "description": "This is a test ticket created via the API",
    "phone": "+1234567890"
  }')

echo "$TICKET_RESPONSE" | json_pp

TICKET_ID=$(echo "$TICKET_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ -n "$TICKET_ID" ]; then
  echo -e "${GREEN}✅ Ticket created! ID: $TICKET_ID${NC}"
else
  echo -e "${RED}❌ Failed to create ticket${NC}"
fi
echo ""
echo ""

# Test 3: Get All Tickets
echo -e "${YELLOW}3. Get All Tickets${NC}"
echo "GET /api/tickets"
TICKETS_RESPONSE=$(curl -s -X GET "$BASE_URL/tickets" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "$TICKETS_RESPONSE" | json_pp

if echo "$TICKETS_RESPONSE" | grep -q "tickets"; then
  echo -e "${GREEN}✅ Tickets retrieved successfully!${NC}"
else
  echo -e "${RED}❌ Failed to get tickets${NC}"
fi
echo ""
echo ""

# Test 4: Get Ticket Stats
echo -e "${YELLOW}4. Get Ticket Stats${NC}"
echo "GET /api/tickets/stats"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/tickets/stats" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "$STATS_RESPONSE" | json_pp

if echo "$STATS_RESPONSE" | grep -q "total"; then
  echo -e "${GREEN}✅ Stats retrieved successfully!${NC}"
else
  echo -e "${RED}❌ Failed to get stats${NC}"
fi
echo ""
echo ""

# Test 5: Get Specific Ticket
if [ -n "$TICKET_ID" ]; then
  echo -e "${YELLOW}5. Get Specific Ticket${NC}"
  echo "GET /api/tickets/$TICKET_ID"
  SINGLE_TICKET=$(curl -s -X GET "$BASE_URL/tickets/$TICKET_ID" \
    -H "Authorization: Bearer $USER_TOKEN")

  echo "$SINGLE_TICKET" | json_pp

  if echo "$SINGLE_TICKET" | grep -q "subject"; then
    echo -e "${GREEN}✅ Ticket retrieved successfully!${NC}"
  else
    echo -e "${RED}❌ Failed to get ticket${NC}"
  fi
  echo ""
  echo ""
fi

# Test 6: Update Ticket
if [ -n "$TICKET_ID" ]; then
  echo -e "${YELLOW}6. Update Ticket${NC}"
  echo "PUT /api/tickets/$TICKET_ID"
  UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/tickets/$TICKET_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -d '{
      "description": "Updated description via API test",
      "phone": "+9876543210"
    }')

  echo "$UPDATE_RESPONSE" | json_pp

  if echo "$UPDATE_RESPONSE" | grep -q "Updated description"; then
    echo -e "${GREEN}✅ Ticket updated successfully!${NC}"
  else
    echo -e "${RED}❌ Failed to update ticket${NC}"
  fi
  echo ""
  echo ""
fi

# Test 7: Send Chat Message
echo -e "${YELLOW}7. Send Chat Message${NC}"
echo "POST /api/chat/messages"
CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "message": "Hello, I need help with my account"
  }')

echo "$CHAT_RESPONSE" | json_pp

if echo "$CHAT_RESPONSE" | grep -q "botResponse"; then
  echo -e "${GREEN}✅ Chat message sent and bot responded!${NC}"
else
  echo -e "${RED}❌ Failed to send chat message${NC}"
fi
echo ""
echo ""

# Test 8: Get Chat Messages
echo -e "${YELLOW}8. Get Chat History${NC}"
echo "GET /api/chat/messages"
CHAT_HISTORY=$(curl -s -X GET "$BASE_URL/chat/messages" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "$CHAT_HISTORY" | json_pp

if echo "$CHAT_HISTORY" | grep -q "messages"; then
  echo -e "${GREEN}✅ Chat history retrieved!${NC}"
else
  echo -e "${RED}❌ Failed to get chat history${NC}"
fi
echo ""
echo ""

# Test 9: Update Profile
echo -e "${YELLOW}9. Update User Profile${NC}"
echo "PUT /api/user/profile"
PROFILE_UPDATE=$(curl -s -X PUT "$BASE_URL/user/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "name": "Updated Test User"
  }')

echo "$PROFILE_UPDATE" | json_pp

if echo "$PROFILE_UPDATE" | grep -q "Updated Test User"; then
  echo -e "${GREEN}✅ Profile updated successfully!${NC}"
else
  echo -e "${RED}❌ Failed to update profile${NC}"
fi
echo ""
echo ""

# Test 10: Filter Tickets
echo -e "${YELLOW}10. Filter Tickets (status=open)${NC}"
echo "GET /api/tickets?status=open"
FILTERED_TICKETS=$(curl -s -X GET "$BASE_URL/tickets?status=open" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "$FILTERED_TICKETS" | json_pp

if echo "$FILTERED_TICKETS" | grep -q "tickets"; then
  echo -e "${GREEN}✅ Filtered tickets retrieved!${NC}"
else
  echo -e "${RED}❌ Failed to filter tickets${NC}"
fi
echo ""
echo ""

echo "=============================================="
echo -e "${GREEN}✅ Phase 3 User Features testing complete!${NC}"
echo ""
echo "📝 Summary of tested features:"
echo "   ✅ User Profile (get, update)"
echo "   ✅ Tickets (create, read, update, filter, stats)"
echo "   ✅ Chat (send message, get history, bot responses)"
echo ""
echo "🗑️  Cleanup (optional):"
if [ -n "$TICKET_ID" ]; then
  echo "   To delete the test ticket: curl -X DELETE \"$BASE_URL/tickets/$TICKET_ID\" -H \"Authorization: Bearer $USER_TOKEN\""
fi
