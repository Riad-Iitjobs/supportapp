# SupportHub - Technical Reference

## Project Overview
A mobile-first (390px width) customer support platform with separate user and admin interfaces. Built with vanilla HTML/CSS/JS using localStorage for data persistence. No backend required.

## Architecture

### File Structure
```
/app
├── index.html              # Entry point - redirects based on auth
├── login.html              # User authentication (login/signup)
├── home.html               # User dashboard (authenticated)
├── tickets.html            # User's ticket list with detail modal
├── submit-ticket.html      # Ticket submission form
├── account.html            # User profile page
├── admin-login.html        # Admin authentication
├── admin.html              # Admin dashboard (3 tabs)
├── styles.css              # Global styles (mobile-first)
├── app.js                  # Utility functions
├── chat-widget.js          # Floating chat bubble (auto-loads on auth pages)
└── admin-data.js           # Dummy data for demo
```

## Authentication Flow

### Entry Point (index.html)
- Checks `localStorage.user.loggedIn`
- **Not logged in** → redirect to `login.html`
- **Logged in** → redirect to `home.html`

### User vs Admin Separation
- **Users**: login.html → home.html → (tickets/account/submit-ticket)
- **Admins**: admin-login.html → admin.html (separate authentication)
- Admin credentials: `admin@supporthub.com` / `admin123`

## localStorage Schema

```javascript
// User session
user: {
  email: string,
  name: string,
  userId: number,
  loggedIn: boolean
}

// User ID mapping (email → userId)
userMappings: {
  "user@email.com": 100,
  "another@email.com": 101
}

// Real users (for admin view)
realUsers: [{
  id: number,
  name: string,
  email: string,
  initials: string,
  status: 'active',
  ticketCount: number
}]

// Tickets (shared between users and admin)
tickets: [{
  id: number (timestamp),
  userId: number,
  subject: string,
  category: 'technical'|'billing'|'feature'|'bug'|'other',
  priority: 'low'|'medium'|'high'|'urgent',
  description: string,
  email: string,
  phone: string,
  status: 'open'|'in-progress'|'resolved'|'closed',
  date: string (formatted),
  createdAt: string (ISO)
}]

// Chat history (per user)
userChats: {
  [userId]: [{
    text: string,
    isUser: boolean,
    timestamp: string (ISO)
  }]
}

// Admin session
adminSession: {
  email: string,
  isAdmin: boolean,
  loginTime: string (ISO)
}
```

## Page Details

### 1. login.html
**Purpose**: User authentication entry point
- **Features**: Login/Signup tabs, form validation, admin login button
- **Auth**: None (redirects if already logged in)
- **Navigation**: No bottom nav
- **Actions**:
  - Login → stores `user` in localStorage → redirects to `home.html`
  - Signup → creates userId via `getUserIdByEmail()` → stores user → redirects to `home.html`
  - Admin button → opens `admin-login.html` in new tab
- **Key Function**: `getUserIdByEmail()` - creates unique userId starting from 100

### 2. home.html (Dashboard)
**Purpose**: User's main dashboard after login
- **Auth**: Required (redirects to login.html if not authenticated)
- **Features**:
  - Personalized welcome message
  - Stats: Total tickets, Open tickets
  - Recent 3 tickets (clickable → opens tickets.html with selectedTicket)
  - Quick actions: Submit New Ticket, View My Tickets
- **Navigation**: Home (active) | Tickets | Account
- **Chat**: Floating bubble available

### 3. tickets.html
**Purpose**: List of user's tickets with detail modal
- **Auth**: Required
- **Features**:
  - Displays only tickets where `ticket.userId === user.userId`
  - Click ticket → modal with full details
  - Empty state with submit button if no tickets
  - Header plus icon → quick submit
- **Navigation**: Home | Tickets (active) | Account
- **Chat**: Floating bubble available
- **Special**: Checks for `localStorage.selectedTicket` (from home.html)

### 4. submit-ticket.html
**Purpose**: Ticket submission form
- **Auth**: Required
- **Features**:
  - Form fields: subject, category, priority, description, phone
  - Auto-fills user email from session
  - Success message → redirects to tickets.html after 2s
  - Creates ticket with `id: Date.now()`
- **Navigation**: Home | Tickets (active) | Account
- **Chat**: Floating bubble available

### 5. account.html
**Purpose**: User profile and statistics
- **Auth**: Required
- **Features**:
  - Avatar with initials
  - Display: name, email, userId
  - Stats: Total tickets, Chat messages
  - Logout button (with confirmation)
- **Navigation**: Home | Tickets | Account (active)
- **Chat**: Floating bubble available

### 6. admin-login.html
**Purpose**: Admin authentication
- **Auth**: None
- **Features**:
  - Email/password form
  - Demo credentials shown in card
  - Validates against hardcoded credentials
  - Stores `adminSession` → redirects to `admin.html`
- **Navigation**: None
- **Close button**: Returns to login.html

### 7. admin.html
**Purpose**: Admin dashboard with 3 tabs
- **Auth**: Required admin session (redirects to admin-login.html)
- **Features**:
  - **Dashboard Tab**: Stats cards (Total, Open, In Progress, Resolved), Recent 5 tickets
  - **Tickets Tab**: Search input, 5 status filters (All/Open/In Progress/Resolved/Closed), All tickets from all users
  - **Chats Tab**: Per-user conversation threads, click to expand full chat history
  - Merges dummy data with real localStorage data
- **Key Functions**:
  - `getAllTickets()` - merges DUMMY_TICKETS + localStorage.tickets
  - `getAllUsers()` - merges DUMMY_USERS + localStorage.realUsers
  - `getUserById()` - finds user by ID
- **Navigation**: None (admin interface)

## Chat Widget (chat-widget.js)

**Auto-loads** on all authenticated user pages (not on login/admin)

### Features
- Floating bubble (bottom-right, above bottom nav)
- Click → opens modal chat window
- AI pattern-based responses (keywords: greetings, help, ticket, billing, technical, account)
- Persists to `localStorage.userChats[userId]`
- Loads chat history on page load

### Implementation
- Self-executing function that checks `user.loggedIn`
- Injects HTML and styles into page
- Global functions: `toggleChat()`, `handleSendMessage()`

## Key Technical Patterns

### User ID System
- Email → unique userId (starting from 100)
- `getUserIdByEmail()` creates mapping in `localStorage.userMappings`
- Adds user to `localStorage.realUsers` for admin visibility

### Authentication Check Pattern
```javascript
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (!user.loggedIn) {
  window.location.href = 'login.html';
}
```

### Data Filtering Pattern
```javascript
// User sees only their data
const userTickets = allTickets.filter(t => t.userId === user.userId);

// Admin sees all data
const allTickets = [...DUMMY_TICKETS, ...localStorage.tickets];
```

## Styling System

### CSS Variables (styles.css)
```css
--mobile-width: 390px;
--primary: #4F46E5;
--background: #F9FAFB;
--surface: #FFFFFF;
--text-primary: #111827;
--text-secondary: #6B7280;
--border: #E5E7EB;
```

### Layout
- `.mobile-container`: max-width 390px, centered on desktop
- `.header`: sticky top, 60px height
- `.bottom-nav`: fixed bottom, 70px height, 4 items (user pages only)
- `.main-content`: scrollable area between header and bottom nav

## Connection Flow

```
SERVER START
    ↓
index.html (checks auth)
    ↓
    ├─→ NOT LOGGED IN → login.html
    │                       ↓
    │                   [Login/Signup]
    │                       ↓
    └─→ LOGGED IN ──────→ home.html (Dashboard)
                            ↓
            ┌───────────────┼───────────────┐
            ↓               ↓               ↓
      tickets.html    submit-ticket.html   account.html
            ↓
      [Click ticket]
            ↓
      [Modal Detail]

ADMIN FLOW (separate):
login.html → [Admin button] → admin-login.html → admin.html
                                                     ↓
                                    [Dashboard | Tickets | Chats tabs]
```

## Important Notes

1. **No Backend**: All data in localStorage, resets on browser clear
2. **Mobile First**: 390px width, responsive on desktop
3. **Chat Widget**: Auto-loads via script tag on authenticated pages
4. **Admin Separation**: Completely separate auth and interface
5. **Demo Data**: admin-data.js provides DUMMY_TICKETS and DUMMY_USERS
6. **Security**: Client-side only, not production-ready (localStorage passwords)

## Quick Start for Development

1. Open `index.html` in browser (will redirect to login.html)
2. Create user account → auto-logged in → redirected to home.html
3. Submit tickets, chat with AI, view account
4. Access admin: Click "Admin Login" button → opens in new tab
5. Admin view: See all tickets and chats from all users

## Common Modifications

- **Add ticket field**: Edit submit-ticket.html form + tickets storage
- **Change theme**: Modify CSS variables in styles.css
- **Add chat responses**: Update botResponses object in chat-widget.js
- **Modify admin stats**: Edit loadDashboard() in admin.html
- **Change mobile width**: Update --mobile-width in styles.css
