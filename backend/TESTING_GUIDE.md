# Authentication Endpoints Testing Guide

## Prerequisites

Before testing, ensure you have:
1. ✅ Installed dependencies (`npm install`)
2. ✅ Configured `.env` file with MySQL credentials
3. ✅ Run migrations (`npm run migrate`)
4. ✅ Generated and updated admin password hash

## Setup Admin Password

### Step 1: Generate Admin Password Hash

```bash
node migrations/generate-admin-hash.js admin123
```

This will output something like:
```
🔐 Generating hash for password: "admin123"

✅ Generated hash:
$2b$10$rKQ2c4Y5JJ5Z7aqZ6Z0h6Oe2OzJH7rWZ0X0X0X0X0X0X0X0X0X0X0

📝 To update the admin user, run this SQL:
UPDATE admin_users SET password_hash = '$2b$10$...' WHERE email = 'admin@supporthub.com';
```

### Step 2: Update Admin Password in Database

Connect to MySQL and run:

```bash
mysql -u root -p supporthub_db
```

```sql
UPDATE admin_users
SET password_hash = 'YOUR_GENERATED_HASH_HERE'
WHERE email = 'admin@supporthub.com';

-- Verify the update
SELECT id, email, name FROM admin_users WHERE email = 'admin@supporthub.com';

exit;
```

## Start the Server

```bash
# Development mode (with auto-reload)
npm run dev
```

Expected output:
```
🚀 Starting SupportHub Backend Server...
📌 Environment: development
✅ Database connected successfully
✅ Server is running on http://localhost:3000
📡 API base URL: http://localhost:3000/api
🏥 Health check: http://localhost:3000/health
```

## Testing Methods

### Method 1: Automated Test Script (Quick)

Run the included test script:

```bash
./test-auth.sh
```

This will test all authentication endpoints automatically.

### Method 2: Postman/Insomnia (Recommended)

#### Import Postman Collection

1. Open Postman
2. Click **Import**
3. Select `SupportHub-API.postman_collection.json`
4. The collection includes all auth endpoints

#### Test Endpoints in Order:

1. **Health Check** - Verify server is running
2. **User Signup** - Create a test user
3. **User Login** - Login with created user (save the token)
4. **Admin Login** - Login as admin (save the admin token)
5. **Refresh Token** - Test token refresh (use saved token)

### Method 3: cURL Commands (Manual)

#### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-07T...",
  "uptime": 12.345
}
```

#### 2. User Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Expected response (201 Created):
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
  "message": "Account created successfully"
}
```

**Save the token!** You'll need it for protected endpoints.

#### 3. User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Expected response (200 OK):
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

#### 4. Admin Login

```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@supporthub.com",
    "password": "admin123"
  }'
```

Expected response (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "email": "admin@supporthub.com",
      "name": "Admin User"
    }
  },
  "message": "Login successful"
}
```

#### 5. Refresh Token

Replace `YOUR_TOKEN_HERE` with the token from login/signup:

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Testing Error Cases

### 1. Duplicate Email

Try signing up with the same email twice:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Expected response (409 Conflict):
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "Email already exists"
  }
}
```

### 2. Invalid Credentials

Try logging in with wrong password:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "wrongpassword"
  }'
```

Expected response (401 Unauthorized):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### 3. Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe"
  }'
```

Expected response (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required"
  }
}
```

### 4. Invalid Email Format

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email",
    "password": "password123"
  }'
```

Expected response (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
```

### 5. Short Password

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john2@example.com",
    "password": "123"
  }'
```

Expected response (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password must be between 6 and 128 characters"
  }
}
```

### 6. Missing Authorization Header

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json"
```

Expected response (401 Unauthorized):
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Access token required"
  }
}
```

### 7. Invalid Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid.token.here"
```

Expected response (403 Forbidden):
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Invalid or expired token"
  }
}
```

## Troubleshooting

### Server won't start
- Check MySQL is running: `mysql -u root -p`
- Verify `.env` database credentials
- Check port 3000 is not in use: `lsof -i :3000`

### Admin login fails
- Make sure you updated the admin password hash in the database
- Verify the admin user exists: `SELECT * FROM admin_users;`
- Check the password you're using matches the one you hashed

### Database connection errors
- Ensure MySQL server is running
- Check database name exists: `SHOW DATABASES;`
- Verify user has proper permissions

### Token errors
- Make sure JWT_SECRET is set in `.env`
- Check token is included in Authorization header correctly
- Verify token format: `Bearer <token>`

## Next Steps

After confirming authentication works:
1. ✅ Phase 2 complete - Authentication is working!
2. 📝 Phase 3 - Implement User Features (tickets, chat)
3. 📝 Phase 4 - Implement Admin Features
4. 📝 Phase 5 - Frontend Integration
