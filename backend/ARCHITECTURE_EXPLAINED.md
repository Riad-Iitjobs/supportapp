# SupportHub Backend Architecture - Detailed Explanation

## Overview: The Big Picture

The backend follows a **layered architecture** pattern with clear separation of concerns:

```
Client Request
      ↓
[Express Server] ← server.js (entry point)
      ↓
[Middleware Layer] ← auth, rate limiting, error handling
      ↓
[Routes] ← defines endpoints
      ↓
[Controllers] ← business logic
      ↓
[Models] ← database queries
      ↓
[MySQL Database]
```

Each layer has a specific responsibility and doesn't skip layers. This makes the code maintainable and testable.

---

## Phase 1: Backend Foundation

### 1. Entry Point: `server.js`

**Purpose:** Starts the HTTP server and initializes the application.

**What it does:**
```javascript
1. Load environment variables from .env file
2. Test database connection
3. Start Express server on port 3000
4. Handle uncaught errors gracefully
```

**Key lines:**
```javascript
require('dotenv').config();           // Load .env variables
const app = require('./src/app');     // Import Express app
const { testConnection } = require('./src/config/database');

await testConnection();                // Test DB before starting
app.listen(PORT, () => { ... });      // Start server
```

**Flow:**
```
server.js starts
    ↓
Loads .env (DB credentials, JWT secret, etc.)
    ↓
Tests MySQL connection
    ↓
If DB connected: ✅ Start server
If DB failed: ⚠️  Start anyway but warn user
```

---

### 2. Express App: `src/app.js`

**Purpose:** Configure Express application with all middleware and routes.

**What it does:**
```javascript
1. Set up security (helmet, CORS)
2. Parse JSON request bodies
3. Add rate limiting
4. Register API routes
5. Handle 404 errors
6. Handle all errors globally
```

**Middleware Stack (Order matters!):**
```javascript
1. helmet()              → Security headers
2. cors()                → Allow frontend to make requests
3. express.json()        → Parse JSON body
4. morgan('dev')         → Log requests (dev only)
5. Rate limiters         → Prevent abuse
6. Routes                → Handle endpoints
7. 404 handler           → Not found errors
8. Error handler         → All errors
```

**Why order matters:**
- Security first (helmet)
- Parse body before routes need it
- Routes before 404 handler
- Error handler MUST be last

**Example request flow through middleware:**
```
POST /api/auth/login
    ↓
helmet adds security headers
    ↓
CORS checks if frontend is allowed
    ↓
express.json() parses {"email":"...","password":"..."}
    ↓
Rate limiter checks: too many requests?
    ↓
Matches route: /api/auth → auth routes
    ↓
Executes controller function
    ↓
If error: Error handler catches it
```

---

### 3. Database Connection: `src/config/database.js`

**Purpose:** Create and manage MySQL connection pool.

**What is a connection pool?**
```
Instead of opening/closing a DB connection for each request,
we maintain a "pool" of 10 ready-to-use connections.

Request 1 → grabs connection #1 → uses it → returns it to pool
Request 2 → grabs connection #2 → uses it → returns it to pool
Request 11 → waits for a connection to be returned

This is MUCH faster than creating connections each time.
```

**How it's used in models:**
```javascript
const { pool } = require('../config/database');

// In a model function:
const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
```

**Key settings:**
```javascript
connectionLimit: 10     // Max 10 simultaneous DB connections
waitForConnections: true // Wait if all 10 are busy
queueLimit: 0           // No limit on waiting queue
```

---

### 4. Configuration Files

#### `src/config/jwt.js`
**Purpose:** JWT token settings.

```javascript
secret: process.env.JWT_SECRET      // Key to sign tokens
expiresIn: '7d'                     // Token valid for 7 days
algorithm: 'HS256'                  // Encryption algorithm
```

#### `src/config/constants.js`
**Purpose:** Centralized constants used throughout the app.

```javascript
TICKET_CATEGORIES: ['technical', 'billing', ...]  // Valid categories
TICKET_STATUSES: ['open', 'in-progress', ...]     // Valid statuses
MIN_PASSWORD_LENGTH: 6                            // Validation rules
MESSAGES: { ... }                                 // Error messages
```

**Why centralize?** Change in one place instead of 20+ places.

---

### 5. Utility Functions

#### `src/utils/passwordHash.js`
**Purpose:** Hash and compare passwords using bcrypt.

```javascript
hashPassword('password123')
    ↓
Uses bcrypt with 10 rounds of hashing
    ↓
Returns: '$2b$10$rKQ2c4Y5JJ5Z...' (60 chars, unique each time)

comparePassword('password123', hash)
    ↓
Compares plaintext with hash
    ↓
Returns: true or false
```

**Why bcrypt?**
- Slow on purpose (prevents brute force)
- Salted automatically (same password → different hashes)
- One-way (can't decrypt the hash)

#### `src/utils/responseFormatter.js`
**Purpose:** Standardize all API responses.

**Success:**
```javascript
successResponse(data, message)
    ↓
{
  success: true,
  data: { ... },
  message: "Login successful"
}
```

**Error:**
```javascript
errorResponse(code, message)
    ↓
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Email is required"
  }
}
```

**Why standardize?** Frontend always knows what to expect.

#### `src/utils/validation.js`
**Purpose:** Validate user inputs.

```javascript
isValidEmail('test@example.com')     → true
isValidEmail('not-an-email')         → false

isValidPassword('123')               → false (too short)
isValidPassword('password123')       → true

isValidCategory('technical')         → true
isValidCategory('invalid')           → false
```

---

### 6. Middleware

#### `src/middleware/auth.js`
**Purpose:** Verify JWT tokens on protected routes.

**How it works:**
```javascript
Request headers: { Authorization: "Bearer eyJhbGc..." }
    ↓
Extract token: "eyJhbGc..."
    ↓
Verify with JWT secret
    ↓
If valid: Decode token → { userId: 100, email: "...", type: "user" }
    ↓
Attach to request: req.user = { userId: 100, ... }
    ↓
Call next() → Continue to controller
    ↓
If invalid: Return 401/403 error
```

**Used on protected routes:**
```javascript
router.get('/profile', authenticateToken, getUserProfile);
                       ↑
                  Middleware runs first
```

#### `src/middleware/adminAuth.js`
**Purpose:** Verify user is an admin.

**How it works:**
```javascript
Check if req.user exists (must run AFTER authenticateToken)
    ↓
Check if req.user.type === 'admin'
    ↓
If yes: next() → Continue
If no: Return 403 Forbidden
```

**Usage:**
```javascript
router.get('/admin/stats',
  authenticateToken,    // First: verify token
  requireAdmin,         // Second: verify admin
  getStats             // Finally: run controller
);
```

#### `src/middleware/errorHandler.js`
**Purpose:** Catch all errors and format them properly.

**Error types it handles:**
```javascript
1. Validation errors → 400
2. Duplicate entry (email exists) → 409
3. JWT errors (expired, invalid) → 403
4. Custom errors with statusCode → use that code
5. Unknown errors → 500
```

**Example flow:**
```javascript
Controller throws error: new Error('Email already exists')
    ↓
Express catches it
    ↓
Passes to errorHandler middleware
    ↓
Checks error type (ER_DUP_ENTRY from MySQL)
    ↓
Returns formatted error:
{
  success: false,
  error: {
    code: "DUPLICATE_ENTRY",
    message: "Email already exists"
  }
}
```

---

### 7. Database Migrations

#### Migration Files (`.sql`)
**Purpose:** Create database tables in the correct order.

**Order matters due to foreign keys:**
```
1. Create users table (no dependencies)
2. Create admin_users table (no dependencies)
3. Create tickets table (depends on users)
4. Create chat_messages table (depends on users)
```

**Example: `001_create_users_table.sql`**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,    -- Auto-incrementing ID
  email VARCHAR(255) UNIQUE,            -- Must be unique
  password_hash VARCHAR(255),           -- Hashed password
  INDEX idx_email (email)               -- Fast email lookups
);
```

**Why indexes?**
```
Without index: Search 1 million users → check each one (slow)
With index: Search 1 million users → use B-tree lookup (fast)
```

#### `migrations/migrate.js`
**Purpose:** Run all SQL migration files.

**What it does:**
```javascript
1. Connect to MySQL server
2. Create database if it doesn't exist
3. Read all .sql files in migrations/
4. Execute them in order (001, 002, 003, 004)
5. Report success/failure for each
```

---

## Phase 2: Authentication

### Architecture Overview

```
Client sends login request
    ↓
[Express] receives POST /api/auth/login
    ↓
[Rate Limiter] checks: too many login attempts?
    ↓
[Route] /api/auth/login → calls authController.login
    ↓
[Controller] login function
    ↓
[Model] userModel.findUserByEmail()
    ↓
[Database] SELECT * FROM users WHERE email = ?
    ↓
[Controller] Compare password with hash
    ↓
[Controller] Generate JWT token
    ↓
[Response] Return token + user info
```

---

### 1. Models (Data Layer)

**Purpose:** Execute database queries. NO business logic here.

#### `src/models/userModel.js`

**Functions:**

1. **createUser(userData)**
```javascript
Takes: { name, email, password_hash, initials }
Does: INSERT INTO users (...)
Returns: { id: 1, name: "John", email: "john@...", initials: "JD" }
```

2. **findUserByEmail(email)**
```javascript
Takes: "john@example.com"
Does: SELECT * FROM users WHERE email = ?
Returns: Full user object with password_hash (for login)
```

3. **findUserById(userId)**
```javascript
Takes: 100
Does: SELECT (everything except password_hash) WHERE id = ?
Returns: User object WITHOUT password_hash (for profile)
```

4. **getUserProfile(userId)**
```javascript
Takes: 100
Does:
  - SELECT user data
  - COUNT tickets for this user
  - COUNT chat messages for this user
Returns: User + ticketCount + messageCount
```

**Why separate functions?**
- `findUserByEmail` → returns password_hash (needed for login)
- `findUserById` → excludes password_hash (for profile display)
- Different use cases, different data returned

#### `src/models/adminModel.js`

**Functions:**

1. **findAdminByEmail(email)**
```javascript
Takes: "admin@supporthub.com"
Does: SELECT * FROM admin_users WHERE email = ?
Returns: Admin object with password_hash
```

2. **updateLastLogin(adminId)**
```javascript
Takes: 1
Does: UPDATE admin_users SET last_login = NOW() WHERE id = ?
Returns: void (just updates the timestamp)
```

---

### 2. Controllers (Business Logic Layer)

**Purpose:** Handle request logic, validation, and response formatting.

#### `src/controllers/authController.js`

**Function: signup(req, res, next)**

**Step-by-step flow:**
```javascript
1. Extract data from request body
   const { name, email, password } = req.body;

2. Validate inputs
   - Is email provided? → if not, return 400 error
   - Is email valid format? → if not, return 400 error
   - Is password long enough? → if not, return 400 error

3. Sanitize inputs
   - Trim whitespace
   - Convert email to lowercase
   - Generate initials from name

4. Check if email exists
   const existingUser = await userModel.findUserByEmail(email);
   if (existingUser) → return 409 "Email already exists"

5. Hash the password
   const hash = await hashPassword(password);

6. Create user in database
   const user = await userModel.createUser({...});

7. Generate JWT token
   const token = jwt.sign({ userId: user.id, email, type: 'user' }, secret);

8. Return success response
   res.status(201).json({
     success: true,
     data: { token, user },
     message: "Account created successfully"
   });
```

**Function: login(req, res, next)**

**Step-by-step flow:**
```javascript
1. Extract credentials
   const { email, password } = req.body;

2. Validate inputs
   - Email required?
   - Password required?
   - Email valid format?

3. Find user by email
   const user = await userModel.findUserByEmail(email);
   if (!user) → return 401 "Invalid credentials"

4. Compare passwords
   const isMatch = await comparePassword(password, user.password_hash);
   if (!isMatch) → return 401 "Invalid credentials"

5. Generate JWT token
   const token = jwt.sign({ userId: user.id, ... });

6. Return token and user info
   res.json({ success: true, data: { token, user } });
```

**Function: adminLogin(req, res, next)**

**Same as login but:**
```javascript
1. Queries admin_users table (not users table)
2. Token includes: { adminId, email, type: 'admin' }
3. Updates last_login timestamp after successful login
```

**Why separate admin login?**
- Different database table (admin_users vs users)
- Different token type (admin vs user)
- Different permissions in JWT payload

---

### 3. Routes (API Endpoint Definitions)

#### `src/routes/auth.js`

**Purpose:** Map HTTP endpoints to controller functions.

```javascript
POST /api/auth/signup → authController.signup
POST /api/auth/login → authController.login
POST /api/auth/admin/login → authController.adminLogin
POST /api/auth/refresh → authenticateToken → authController.refreshToken
                         ↑
                      Middleware runs first
```

**How routes are registered:**
```javascript
// In app.js:
app.use('/api/auth', authLimiter, require('./routes/auth'));
         ↑                ↑              ↑
      Prefix          Middleware     Routes file

// Results in:
POST /api/auth/signup
POST /api/auth/login
...
```

---

## Complete Request Flow Example

### Example: User Login

**1. Client sends request:**
```http
POST /api/auth/login
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**2. Request enters server.js:**
```javascript
Express server receives request on port 3000
    ↓
Passes to app (src/app.js)
```

**3. Goes through middleware in app.js:**
```javascript
helmet() → adds security headers
cors() → checks origin is allowed
express.json() → parses JSON body into req.body
morgan() → logs: "POST /api/auth/login 200 45ms"
authLimiter → checks if too many requests (max 10 per 15min)
```

**4. Matches route:**
```javascript
/api/auth → auth router
  /login → POST handler → authController.login
```

**5. Controller executes (authController.login):**
```javascript
// Step 1: Validate inputs
if (!email) return 400 error
if (!isValidEmail(email)) return 400 error

// Step 2: Find user in database
const user = await userModel.findUserByEmail('john@example.com')
```

**6. Model executes (userModel.findUserByEmail):**
```javascript
// Executes SQL query
const [rows] = await pool.query(
  'SELECT * FROM users WHERE email = ?',
  ['john@example.com']
);

// Returns to controller:
{
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  password_hash: "$2b$10$rKQ2c4Y5...",
  initials: "JD"
}
```

**7. Controller continues:**
```javascript
// Step 3: Compare password
const isMatch = await comparePassword('password123', user.password_hash);
// bcrypt compares → returns true

// Step 4: Generate JWT token
const token = jwt.sign(
  { userId: 1, email: 'john@example.com', type: 'user' },
  'jwt-secret-key',
  { expiresIn: '7d' }
);
// Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Step 5: Format response
const response = successResponse(
  { token, user: { id: 1, name: "John Doe", ... } },
  "Login successful"
);
```

**8. Response sent back:**
```javascript
res.status(200).json({
  success: true,
  data: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    user: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      initials: "JD"
    }
  },
  message: "Login successful"
});
```

**9. Client receives:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "initials": "JD"
    }
  },
  "message": "Login successful"
}
```

**10. Client stores token:**
```javascript
localStorage.setItem('authToken', data.token);
```

---

## How Protected Routes Work

### Example: GET /api/user/profile (coming in Phase 3)

**1. Client sends request WITH token:**
```http
GET /api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. Request hits route:**
```javascript
router.get('/profile', authenticateToken, getUserProfile);
                       ↑
                    Middleware runs first
```

**3. authenticateToken middleware:**
```javascript
// Extract token from header
const authHeader = req.headers['authorization'];
const token = authHeader.split(' ')[1]; // "Bearer TOKEN"

// Verify token
jwt.verify(token, 'jwt-secret', (err, payload) => {
  if (err) return res.status(403).json({ error: "Invalid token" });

  // Token is valid, attach user info to request
  req.user = payload; // { userId: 1, email: "...", type: "user" }

  next(); // Continue to getUserProfile controller
});
```

**4. Controller has access to req.user:**
```javascript
async function getUserProfile(req, res) {
  const userId = req.user.userId; // From JWT token

  const profile = await userModel.getUserProfile(userId);

  res.json({ success: true, data: profile });
}
```

---

## Key Concepts Explained

### 1. Why Separate Layers?

**Without layers (bad):**
```javascript
// Everything in one function
app.post('/login', async (req, res) => {
  const email = req.body.email;
  const user = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  const token = jwt.sign({...}, 'secret');
  res.json({ token });
});

// Problems:
// - Hard to test
// - Hard to reuse
// - Mixed concerns (routing + validation + database + auth)
```

**With layers (good):**
```javascript
// Route: Just maps endpoint
router.post('/login', authController.login);

// Controller: Business logic
async function login(req, res) {
  validateInput(req.body);
  const user = await userModel.findByEmail(email);
  const isValid = await comparePassword(password, user.hash);
  const token = generateToken(user);
  res.json({ token });
}

// Model: Database only
async function findByEmail(email) {
  return await pool.query('SELECT * FROM users WHERE email = ?', [email]);
}

// Benefits:
// - Easy to test each layer
// - Reusable functions
// - Clear responsibilities
```

### 2. Why Async/Await?

**Database queries take time:**
```javascript
// ❌ Without await (wrong)
const user = userModel.findUserById(1);
console.log(user.name); // ERROR: user is a Promise, not a user object

// ✅ With await (correct)
const user = await userModel.findUserById(1);
console.log(user.name); // Works! "John Doe"
```

**What await does:**
```javascript
const user = await userModel.findUserById(1);
    ↓
Pause here and wait for database to return result
    ↓
Once done, continue with the actual user object
```

### 3. Why JWT Tokens?

**Session-based auth (old way):**
```
User logs in → Server creates session → Stores in memory/database
Every request → Server checks session database
Problem: Doesn't scale well with multiple servers
```

**JWT auth (modern way):**
```
User logs in → Server creates JWT token → Signs it with secret
Every request → Server verifies signature (no database lookup)
Benefits:
  - Stateless (no session storage needed)
  - Scalable (any server can verify)
  - Contains user info (don't need to query database)
```

**JWT Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNjQyNjg2MDAwLCJleHAiOjE2NDMyOTA4MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Header.Payload.Signature
  ↓       ↓       ↓
  |       |       Signature (proves it's authentic)
  |       |
  |       User data: { userId: 1, email: "...", exp: ... }
  |
  Algorithm: HS256
```

**Decoding (client-side):**
```javascript
// Client can decode payload (it's just base64)
const payload = JSON.parse(atob(token.split('.')[1]));
// { userId: 1, email: "john@example.com", type: "user" }

// But can't fake the signature (needs secret key)
```

### 4. Why Connection Pooling?

**Without pool:**
```
Request 1: Open connection → Query → Close connection (300ms)
Request 2: Open connection → Query → Close connection (300ms)
Request 3: Open connection → Query → Close connection (300ms)
```

**With pool:**
```
Pool: [Conn1, Conn2, Conn3, ..., Conn10] (always open)

Request 1: Borrow Conn1 → Query → Return Conn1 (50ms)
Request 2: Borrow Conn2 → Query → Return Conn2 (50ms)
Request 3: Borrow Conn3 → Query → Return Conn3 (50ms)

Much faster! No connection overhead.
```

---

## Security Considerations

### 1. Password Storage
```javascript
// ❌ NEVER store plaintext
password: "password123"  // Anyone with DB access can see it

// ✅ Always hash
password_hash: "$2b$10$rKQ2c4Y5..."  // One-way, can't reverse
```

### 2. SQL Injection Prevention
```javascript
// ❌ String concatenation (vulnerable)
pool.query(`SELECT * FROM users WHERE email = '${email}'`);
// Attacker sends: email = "' OR '1'='1"
// Query becomes: SELECT * FROM users WHERE email = '' OR '1'='1'
// Returns all users!

// ✅ Parameterized queries (safe)
pool.query('SELECT * FROM users WHERE email = ?', [email]);
// MySQL escapes the value automatically
```

### 3. JWT Secret
```javascript
// ❌ Weak secret
secret: '123'

// ✅ Strong secret (32+ random characters)
secret: 'supporthub-jwt-secret-key-change-this-in-production-min-32-chars'
```

### 4. Rate Limiting
```javascript
// Prevents brute force attacks
authLimiter: 10 requests per 15 minutes
// Attacker tries 1000 passwords → blocked after 10 attempts
```

---

## Summary

**Phase 1 - Foundation:**
- ✅ Server setup (server.js, app.js)
- ✅ Database connection pooling
- ✅ Middleware (auth, error handling, security)
- ✅ Utilities (validation, password hashing, response formatting)
- ✅ Database migrations

**Phase 2 - Authentication:**
- ✅ User model (database queries for users)
- ✅ Admin model (database queries for admins)
- ✅ Auth controller (signup, login, admin login logic)
- ✅ Auth routes (endpoint definitions)
- ✅ JWT token generation and verification

**Request Flow:**
```
Client → Express → Middleware → Routes → Controller → Model → Database
Database → Model → Controller → Response Formatter → Client
```

**Key Patterns:**
- **Separation of concerns**: Each file has one responsibility
- **Async/await**: Handle asynchronous database operations
- **Error handling**: Centralized error middleware
- **Validation**: Check inputs before processing
- **Security**: Rate limiting, CORS, helmet, bcrypt, JWT

---

## Phase 3: User Features (Tickets, Chat, Profile)

### Architecture Overview

Phase 3 adds user-facing features following the same patterns as Phase 2:

```
Client sends request with JWT token
    ↓
[Auth Middleware] verifies token → attaches req.user
    ↓
[Route] matches endpoint
    ↓
[Controller] validates input, processes logic
    ↓
[Model] executes database query
    ↓
[Database] returns data
    ↓
[Controller] formats response
    ↓
[Client] receives data
```

---

### 1. Ticket System

#### Models: `src/models/ticketModel.js`

**createTicket(ticketData)**
```javascript
Takes: { userId, subject, category, priority, description, email, phone }
Does: INSERT INTO tickets (...) VALUES (...)
Returns: { id, userId, subject, ..., status: 'open', createdAt }

Why status is 'open': All new tickets start as open, only admins can change status later
```

**getTicketsByUserId(userId, filters)**
```javascript
Takes: userId = 100, filters = { status: 'open', category: 'technical' }
Does: SELECT * FROM tickets WHERE user_id = 100 AND status = 'open' AND category = 'technical'
Returns: Array of matching tickets

Dynamic query building:
- Base query: WHERE user_id = ?
- If filter.status: AND status = ?
- If filter.category: AND category = ?
- Always: ORDER BY created_at DESC (newest first)
```

**getTicketById(ticketId, userId)**
```javascript
Takes: ticketId = 5, userId = 100
Does: SELECT * FROM tickets WHERE id = 5 AND user_id = 100
Returns: Single ticket or null

Why check userId? Security! Users can only see their own tickets.
If ticket exists but belongs to another user → returns null (not found)
```

**updateTicket(ticketId, userId, updates)**
```javascript
Takes: ticketId = 5, userId = 100, updates = { description: "New text", phone: "..." }
Does: UPDATE tickets SET description = ?, phone = ? WHERE id = 5 AND user_id = 100
Returns: Updated ticket or null

Restriction: Users can only update description and phone
They CANNOT update: status, category, priority, subject
(Admins can update status in Phase 4)
```

**getTicketStats(userId)**
```javascript
Takes: userId = 100
Does: SELECT COUNT(*), SUM(CASE WHEN status = 'open'...) FROM tickets WHERE user_id = 100
Returns: { total: 10, open: 3, inProgress: 2, resolved: 4, closed: 1 }

SQL trick: Use CASE WHEN to count by status in one query instead of 5 separate queries
```

#### Controllers: `src/controllers/ticketController.js`

**createTicket(req, res, next)**

**Step-by-step:**
```javascript
1. Extract data from request
   const { subject, category, priority, description, phone } = req.body;
   const userId = req.user.userId; // From JWT token
   const email = req.user.email;   // From JWT token

2. Validate required fields
   if (!subject) → return 400 "Subject is required"
   if (!category) → return 400 "Category is required"
   if (!priority) → return 400 "Priority is required"

3. Validate category against allowed values
   if (!['technical','billing','feature','bug','other'].includes(category))
     → return 400 "Category must be one of: ..."

4. Validate priority
   if (!['low','medium','high','urgent'].includes(priority))
     → return 400 "Priority must be one of: ..."

5. Sanitize all text inputs
   subject = sanitizeString(subject) // Trims whitespace
   description = sanitizeString(description) || null

6. Create ticket in database
   const ticket = await ticketModel.createTicket({ userId, subject, ... });

7. Return 201 Created
   res.status(201).json({ success: true, data: ticket })
```

**getTickets(req, res, next)**
```javascript
1. Get userId from JWT token
   const userId = req.user.userId;

2. Get optional filters from query params
   const { status, category, priority } = req.query;
   // Example: /api/tickets?status=open&category=technical

3. Build filters object
   const filters = {};
   if (status) filters.status = status;
   if (category) filters.category = category;

4. Get tickets from database
   const tickets = await ticketModel.getTicketsByUserId(userId, filters);

5. Return tickets with count
   res.json({ success: true, data: { tickets, total: tickets.length } });
```

**Why filters are important:**
```
User has 100 tickets
Without filters: Returns all 100 (slow, cluttered UI)
With filters: /api/tickets?status=open → Returns only 5 open tickets
Frontend can show tabs: All | Open | In Progress | Resolved | Closed
```

#### Routes: `src/routes/ticket.js`

**Order matters for Express routing:**
```javascript
// ✅ Correct order
router.get('/stats', getTicketStats);      // /api/tickets/stats
router.get('/:id', getTicketById);         // /api/tickets/123

// ❌ Wrong order
router.get('/:id', getTicketById);         // /api/tickets/stats matches this!
router.get('/stats', getTicketStats);      // Never reached

Why: Express matches routes in order. '/stats' would match '/:id' pattern
```

**Route protection:**
```javascript
router.use(authenticateToken); // Applied to ALL routes in this file

// Now all routes require authentication:
router.get('/', getTickets);        // Protected
router.post('/', createTicket);     // Protected
router.get('/:id', getTicketById);  // Protected
```

---

### 2. Chat System

#### Models: `src/models/chatModel.js`

**createMessage(userId, message, isUserMessage)**
```javascript
Takes: userId = 100, message = "Hello", isUserMessage = true
Does: INSERT INTO chat_messages (user_id, message, is_user_message) VALUES (100, "Hello", true)
Returns: { id: 1, userId: 100, message: "Hello", isUserMessage: true, createdAt: "..." }

isUserMessage flag:
- true: Message sent by user
- false: Message sent by bot
```

**getMessagesByUserId(userId)**
```javascript
Takes: userId = 100
Does: SELECT * FROM chat_messages WHERE user_id = 100 ORDER BY created_at ASC
Returns: Array of messages in chronological order

Why ASC not DESC? Chat shows oldest first (like WhatsApp)
```

**getMessagesSince(userId, since)**
```javascript
Takes: userId = 100, since = "2026-01-07T10:30:00.000Z"
Does: SELECT * FROM chat_messages WHERE user_id = 100 AND created_at > "2026-01-07T10:30:00.000Z"
Returns: Only new messages after the timestamp

Used for polling:
1. Frontend gets all messages at page load
2. Every 3 seconds: poll for messages since last timestamp
3. If new messages → display them
4. Update timestamp
```

#### Controllers: `src/controllers/chatController.js`

**Bot Response System:**
```javascript
// Pattern matching (same as frontend chat-widget.js)
const botResponses = {
  greetings: ["Hi there!", "Hello!", "Hey!"],
  help: ["I can help you with..."],
  ticket: ["I can help you create a ticket..."],
  billing: ["For billing questions..."],
  technical: ["I'd be happy to help with technical issues..."],
  account: ["For account questions..."],
  default: ["I understand...", "Thanks for reaching out..."]
};

function generateBotResponse(userMessage) {
  const msg = userMessage.toLowerCase();

  if (msg.match(/\b(hi|hello|hey)\b/))
    return random from botResponses.greetings;

  if (msg.match(/\b(help|support)\b/))
    return botResponses.help[0];

  if (msg.match(/\b(ticket|issue)\b/))
    return botResponses.ticket[0];

  // ... more patterns ...

  return random from botResponses.default;
}
```

**sendMessage(req, res, next)**

**Complete flow:**
```javascript
1. Get message from request
   const { message } = req.body;
   const userId = req.user.userId;

2. Validate message
   if (!message || message.trim() === '')
     → return 400 "Message is required"

3. Create user message in database
   const userMessage = await chatModel.createMessage(userId, message, true);
   // { id: 1, userId: 100, message: "Hello", isUserMessage: true }

4. Generate bot response using pattern matching
   const botText = generateBotResponse(message);
   // If message contains "help" → returns help response

5. Add small delay (simulate thinking)
   await new Promise(resolve => setTimeout(resolve, 500));
   // Makes bot feel more natural

6. Create bot message in database
   const botMessage = await chatModel.createMessage(userId, botText, false);
   // { id: 2, userId: 100, message: "I can help...", isUserMessage: false }

7. Return BOTH messages
   res.status(201).json({
     success: true,
     data: {
       userMessage: { id: 1, message: "Hello", ... },
       botResponse: { id: 2, message: "I can help...", ... }
     }
   });
```

**Why return both messages?**
```
Frontend doesn't need to make 2 requests:
1. POST to send user message
2. GET to fetch bot response

Instead, one POST returns both → faster, simpler
```

**pollMessages(req, res, next)**
```javascript
Takes: ?since=2026-01-07T10:30:00.000Z (from query params)
Returns: All messages created after that timestamp

Frontend polling loop:
1. Load page → get all messages → lastTimestamp = last message time
2. setInterval every 3 seconds:
   - fetch('/api/chat/poll?since=' + lastTimestamp)
   - if newMessages → display them
   - update lastTimestamp

This creates "real-time-like" chat without WebSockets
```

---

### 3. User Profile

#### Controllers: `src/controllers/userController.js`

**getUserProfile(req, res, next)**
```javascript
1. Get userId from JWT
   const userId = req.user.userId;

2. Get profile with stats from model
   const profile = await userModel.getUserProfile(userId);
   // Calls 3 queries:
   // - Get user data
   // - Count tickets
   // - Count chat messages

3. Remove password_hash before sending
   delete profile.password_hash;
   // Security: Never send password hash to frontend

4. Return profile
   {
     id: 100,
     name: "John Doe",
     email: "john@example.com",
     initials: "JD",
     ticketCount: 5,
     messageCount: 12
   }
```

**updateUserProfile(req, res, next)**
```javascript
1. Get data from request
   const { name, email } = req.body;
   const userId = req.user.userId;

2. Build updates object (only update provided fields)
   const updates = {};

   if (name !== undefined) {
     if (name.trim() === '') → return 400 "Name cannot be empty"
     updates.name = name.trim();
   }

   if (email !== undefined) {
     if (!isValidEmail(email)) → return 400 "Invalid email"

     // Check if email is taken by ANOTHER user
     const existing = await userModel.findUserByEmail(email);
     if (existing && existing.id !== userId)
       → return 409 "Email already exists"

     updates.email = email.toLowerCase();
   }

3. Check if there are any updates
   if (Object.keys(updates).length === 0)
     → return 400 "No valid fields to update"

4. Update in database
   const updated = await userModel.updateUser(userId, updates);

5. Remove sensitive data and return
   delete updated.password_hash;
   res.json({ success: true, data: updated });
```

**Email uniqueness check explained:**
```javascript
// User 100 tries to update email to "john@example.com"
const existing = await userModel.findUserByEmail("john@example.com");

// Case 1: Email doesn't exist → OK, update
if (!existing) → update email

// Case 2: Email exists but belongs to THIS user → OK, no change needed
if (existing.id === 100) → update email (or skip)

// Case 3: Email exists and belongs to ANOTHER user → ERROR
if (existing && existing.id !== 100) → return 409 conflict

This prevents two users from having the same email
```

---

## Complete Request Flow Examples

### Example 1: Create Ticket

**Client request:**
```http
POST /api/tickets
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "subject": "Cannot login",
  "category": "technical",
  "priority": "high",
  "description": "Getting error 500"
}
```

**Server processing:**
```javascript
1. Request hits Express
2. CORS middleware → checks origin
3. JSON parser → parses body
4. Rate limiter → checks request count
5. Route: POST /api/tickets
6. Auth middleware (authenticateToken):
   - Extracts token from header
   - Verifies token
   - Decodes: { userId: 100, email: "john@example.com", type: "user" }
   - Sets req.user = { userId: 100, email: "...", type: "user" }
7. Controller (createTicket):
   - Validates: subject ✓, category ✓, priority ✓
   - Gets userId from req.user (100)
   - Gets email from req.user ("john@example.com")
   - Calls model.createTicket({ userId: 100, subject: "...", email: "...", ... })
8. Model (createTicket):
   - Executes: INSERT INTO tickets (user_id, subject, category, priority, description, email, status)
              VALUES (100, "Cannot login", "technical", "high", "Getting error 500", "john@example.com", "open")
   - Returns: { id: 1, userId: 100, subject: "Cannot login", status: "open", ... }
9. Controller formats response
10. Client receives:
```

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 100,
    "subject": "Cannot login",
    "category": "technical",
    "priority": "high",
    "description": "Getting error 500",
    "email": "john@example.com",
    "phone": null,
    "status": "open",
    "createdAt": "2026-01-07T10:30:00.000Z"
  },
  "message": "Ticket created successfully"
}
```

### Example 2: Send Chat Message

**Client request:**
```http
POST /api/chat/messages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "message": "I need help with billing"
}
```

**Server processing:**
```javascript
1. Auth middleware verifies token → req.user = { userId: 100, ... }
2. Controller receives message: "I need help with billing"
3. Validate: message exists ✓
4. Create user message:
   INSERT INTO chat_messages (user_id, message, is_user_message)
   VALUES (100, "I need help with billing", true)
   → Returns { id: 1, userId: 100, message: "I need help with billing", isUserMessage: true }

5. Generate bot response:
   - Message contains "billing"
   - Matches pattern: /\b(billing|payment|invoice)\b/
   - Returns: "For billing questions, I recommend creating a ticket..."

6. Wait 500ms (simulate thinking)

7. Create bot message:
   INSERT INTO chat_messages (user_id, message, is_user_message)
   VALUES (100, "For billing questions...", false)
   → Returns { id: 2, userId: 100, message: "For billing...", isUserMessage: false }

8. Return both messages
```

**Client receives:**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": 1,
      "userId": 100,
      "message": "I need help with billing",
      "isUserMessage": true,
      "createdAt": "2026-01-07T10:30:00.000Z"
    },
    "botResponse": {
      "id": 2,
      "userId": 100,
      "message": "For billing questions, I recommend creating a ticket through our ticket system...",
      "isUserMessage": false,
      "createdAt": "2026-01-07T10:30:00.500Z"
    }
  },
  "message": "Message sent successfully"
}
```

---

## Key Design Decisions

### 1. Why Ownership Validation?

**Security requirement:**
```javascript
// Without ownership check (INSECURE):
getTicketById(ticketId) {
  return await pool.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
}
// User 100 can access ticket 5 even if it belongs to User 200!

// With ownership check (SECURE):
getTicketById(ticketId, userId) {
  return await pool.query(
    'SELECT * FROM tickets WHERE id = ? AND user_id = ?',
    [ticketId, userId]
  );
}
// User 100 can ONLY access their own tickets
```

### 2. Why Limit User Update Fields?

**Business logic:**
```javascript
// Users can update:
- description (add more details)
- phone (contact info)

// Users CANNOT update:
- status (open → resolved) → Only admins can close tickets
- category (technical → billing) → Prevents gaming the system
- priority (low → urgent) → Prevents priority abuse
- subject → Would lose ticket history context
```

### 3. Why Sanitize Inputs?

**Security and data quality:**
```javascript
// User sends: "  Hello World  \n  "
sanitizeString(input)
  → Returns: "Hello World"

Benefits:
- Removes leading/trailing whitespace
- Consistent data in database
- Prevents injection attacks
- Better search results
```

### 4. Why Pattern Matching for Bot?

**Simple but effective:**
```javascript
// Alternative 1: AI/ML model (expensive, complex, overkill)
// Alternative 2: Rule-based system (our choice)

Pros:
- Fast (no API calls)
- Predictable responses
- No cost
- Works offline
- Easy to customize

Cons:
- Limited intelligence
- Can't handle complex queries
- No learning capability

For a support bot, simple pattern matching is sufficient
Users want quick answers, not conversation
```

### 5. Why Return Both User + Bot Messages?

**Performance optimization:**
```javascript
// Approach 1: Two requests (slower)
const userMsg = await POST('/api/chat/messages', { message });
const botMsg = await GET('/api/chat/messages'); // Fetch all to get bot response

// Approach 2: One request (faster) ✓
const { userMessage, botResponse } = await POST('/api/chat/messages', { message });

Saves 1 HTTP request per message
Reduces latency by ~100-200ms
```

---

## Phase 3 Summary

**What we built:**
- ✅ Ticket system (CRUD with ownership validation)
- ✅ Chat system (with pattern-matching bot)
- ✅ User profile (with statistics)
- ✅ 13 new API endpoints
- ✅ Filtering, pagination support
- ✅ Input validation and sanitization
- ✅ Security through ownership checks

**Patterns used:**
- Same layered architecture (Routes → Controllers → Models)
- JWT authentication on all endpoints
- Consistent error handling
- Standardized response format
- Parameterized SQL queries

Now you're ready for **Phase 4: Admin Features** where we'll add admin dashboard with full oversight capabilities!
