 Overview

     Migrate SupportHub from localStorage-based client-side app to 
     full-stack application with Node.js + MySQL backend.

     Architecture: Separate /backend folder (sibling to /app), REST API with
      JWT authentication

     Backend Structure

     backend/
     ├── src/
     │   ├── config/          # Database connection, JWT config, constants
     │   ├── middleware/      # auth.js, adminAuth.js, errorHandler.js
     │   ├── controllers/     # authController, ticketController, 
     chatController, adminController
     │   ├── routes/          # Route definitions for each feature
     │   ├── models/          # Data access layer (database queries)
     │   ├── utils/           # Validation, password hashing, helpers
     │   └── app.js           # Express app setup
     ├── migrations/          # SQL migration files
     ├── .env                 # Environment variables
     ├── server.js            # Entry point
     └── package.json

     Database Schema (MySQL)

     Tables

     1. users - id, name, email, password_hash, initials, status, 
     created_at, updated_at
     2. admin_users - id, email, password_hash, name, created_at, last_login
     3. tickets - id, user_id, subject, category, priority, description, 
     email, phone, status, created_at, updated_at
     4. chat_messages - id, user_id, message, is_user_message, created_at

     Indexes: user_id, status, email (unique), created_at for performance

     API Endpoints

     Authentication

     - POST /api/auth/signup - User registration (returns JWT + user)
     - POST /api/auth/login - User login (returns JWT + user)
     - POST /api/auth/admin/login - Admin login (returns JWT + admin)

     User (Protected - JWT required)

     - GET /api/user/profile - Get current user profile
     - GET /api/tickets - Get user's tickets
     - GET /api/tickets/:id - Get specific ticket
     - POST /api/tickets - Create new ticket
     - GET /api/chat/messages - Get user's chat history
     - POST /api/chat/messages - Send chat message (returns user message + 
     bot response)
     - GET /api/chat/poll?since=timestamp - Poll for new messages

     Admin (Protected - Admin JWT required)

     - GET /api/admin/dashboard/stats - Dashboard statistics
     - GET /api/admin/tickets - All tickets with filters/search
     - PUT /api/admin/tickets/:id/status - Update ticket status
     - GET /api/admin/users - All users
     - GET /api/admin/chats - All chat threads
     - GET /api/admin/chats/:userId - Full chat history for user

     Tech Stack

     Backend:
     - Express.js - Web framework
     - mysql2 - MySQL driver with connection pooling
     - bcrypt - Password hashing
     - jsonwebtoken - JWT authentication
     - cors - CORS middleware
     - helmet - Security headers
     - express-rate-limit - Rate limiting

     Frontend Changes:
     - Create auth.js - Token storage, decode JWT, check logged in
     - Create api.js - API client wrapper with all endpoints
     - Update all HTML pages to call APIs instead of localStorage

     Implementation Order

     Phase 1: Backend Foundation (Priority 1)

     1. Create backend folder structure
     2. Initialize npm project and install dependencies
     3. Set up MySQL database and connection pooling
     4. Create database tables with migration scripts
     5. Test database connectivity

     Critical Files:
     - /backend/server.js - Entry point
     - /backend/src/app.js - Express setup
     - /backend/src/config/database.js - MySQL connection
     - /backend/.env - Environment configuration

     Phase 2: Authentication (Priority 2)

     1. Implement password hashing utilities
     2. Create JWT config and middleware
     3. Build auth controller (signup, login, admin login)
     4. Create auth routes
     5. Test with Postman

     Critical Files:
     - /backend/src/controllers/authController.js
     - /backend/src/middleware/auth.js
     - /backend/src/middleware/adminAuth.js
     - /backend/src/utils/passwordHash.js

     Phase 3: User Features (Priority 3)

     1. Ticket CRUD endpoints + controller + model
     2. Chat message endpoints + controller + model
     3. User profile endpoint
     4. Test all endpoints

     Files:
     - /backend/src/controllers/ticketController.js
     - /backend/src/controllers/chatController.js
     - /backend/src/models/ticketModel.js
     - /backend/src/models/chatModel.js

     Phase 4: Admin Features (Priority 4)

     1. Admin dashboard stats endpoint
     2. Admin ticket management
     3. Admin chat viewing
     4. Test admin flows

     Files:
     - /backend/src/controllers/adminController.js
     - /backend/src/models/adminModel.js

     Phase 5: Frontend Integration (Priority 5)

     1. Create /app/js/auth.js - Token management, decode JWT
     2. Create /app/js/api.js - API client with all endpoints
     3. Update frontend pages one by one:
       - login.html - Use api.login(), api.signup()
       - home.html - Use api.getTickets() for stats
       - submit-ticket.html - Use api.createTicket()
       - tickets.html - Use api.getTickets()
       - account.html - Use api.getUserProfile()
       - chat-widget.js - Use api.sendChatMessage(), api.getChatMessages()
       - admin-login.html - Use api.adminLogin()
       - admin.html - Use all admin API endpoints

     Phase 6: Testing & Polish

     1. End-to-end testing of all flows
     2. Error handling (network errors, 401, 404, etc.)
     3. Loading states in frontend
     4. Security audit
     5. Performance optimization

     Key Technical Decisions

     JWT Authentication

     - Tokens stored in localStorage on frontend
     - Token payload: { userId, email, type: 'user'|'admin', exp }
     - 7-day expiration
     - Authorization header: Bearer <token>

     Password Security

     - bcrypt with 10 salt rounds
     - Minimum 6 character password

     Chat System

     - REST API polling (no WebSockets)
     - Frontend polls /api/chat/poll?since=timestamp every 3-5 seconds
     - Bot responses generated server-side using pattern matching

     Error Handling

     - Standard response format:
     {
       "success": true/false,
       "data": {...},
       "error": { "code": "...", "message": "..." }
     }

     Database

     - Connection pooling (10 connections)
     - Prepared statements to prevent SQL injection
     - Foreign keys for data integrity

     Frontend API Integration Pattern

     Before (localStorage):
     const user = JSON.parse(localStorage.getItem('user'));
     const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');

     After (API):
     const user = getCurrentUser(); // Decode JWT
     const response = await api.getTickets();
     const tickets = response.data.tickets;

     Environment Setup

     Backend .env:
     NODE_ENV=development
     PORT=3000
     FRONTEND_URL=http://localhost:8000
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=supporthub_db
     JWT_SECRET=your-32-char-secret

     Migration from localStorage

     1. Export any existing localStorage data
     2. Import into MySQL using migration script
     3. Deploy backend
     4. Update frontend to use API
     5. Test thoroughly
     6. Remove localStorage code

     Files to Modify in Frontend

     1. /app/login.html - Lines 211-256 (handleLogin, handleSignup)
     2. /app/home.html - Lines 91-107 (user data, tickets)
     3. /app/submit-ticket.html - Lines 129-172 (handleTicketSubmit)
     4. /app/tickets.html - Lines 200-244 (fetch tickets)
     5. /app/admin-login.html - Lines 83-113 (handleAdminLogin)
     6. /app/admin.html - Lines 409-645 (all data fetching)
     7. /app/chat-widget.js - Lines 253-324 (handleSendMessage)
     8. /app/account.html - Lines 113-143 (user stats)

     Success Criteria

     - ✅ Backend server running on port 3000
     - ✅ All API endpoints working and tested
     - ✅ JWT authentication flow working
     - ✅ Frontend can login/signup via API
     - ✅ Frontend can create/view tickets via API
     - ✅ Chat system working with API
     - ✅ Admin dashboard working with API
     - ✅ No localStorage usage remaining
     - ✅ Error handling working properly
     - ✅ Security measures in place (rate limiting, CORS, helmet)

     Estimated Timeline

     - Days 1-2: Backend setup + database
     - Days 3-5: Authentication + core backend
     - Days 5-7: User & admin features
     - Days 7-10: Frontend integration
     - Days 10-12: Testing & polish

     Total: 12 days for full implementation

