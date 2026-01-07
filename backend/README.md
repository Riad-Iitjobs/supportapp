# SupportHub Backend API

Node.js + Express + MySQL backend for the SupportHub customer support platform.

## Prerequisites

- Node.js >= 14.0.0
- MySQL >= 5.7 or 8.0
- npm >= 6.0.0

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update the `.env` file with your MySQL database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=supporthub_db
JWT_SECRET=your-secret-key-min-32-characters
```

### 3. Create Database

Create the MySQL database:

```sql
CREATE DATABASE supporthub_db;
```

### 4. Run Migrations

Run the database migrations to create tables:

```bash
npm run migrate
```

### 5. (Optional) Seed Sample Data

To add sample data for testing:

```bash
npm run seed
```

### 6. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### User Endpoints (Protected)
- `GET /api/user/profile` - Get current user profile
- `GET /api/tickets` - Get user's tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/chat/messages` - Get chat history
- `POST /api/chat/messages` - Send chat message

### Admin Endpoints (Protected - Admin only)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/tickets` - All tickets
- `GET /api/admin/users` - All users
- `GET /api/admin/chats` - All chat threads

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, JWT)
│   ├── middleware/      # Express middleware (auth, error handling)
│   ├── controllers/     # Request handlers
│   ├── routes/          # API route definitions
│   ├── models/          # Database queries (data access layer)
│   └── utils/           # Helper functions
├── migrations/          # Database migration SQL files
├── server.js            # Entry point
├── .env                 # Environment variables (not in git)
└── package.json         # Dependencies
```

## Testing

Test the API endpoints using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

## Security Notes

- Change the JWT_SECRET in production to a strong random string
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Set proper CORS origins
- Review rate limiting settings

## License

ISC
