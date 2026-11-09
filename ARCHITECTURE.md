# Chase Bank Clone - Technical Architecture Document

## 1. Executive Summary

This document outlines the technical architecture for a premium, high-fidelity banking web application that replicates the Chase Bank web platform's user interface and aesthetic experience. The application features a React/TypeScript frontend with a Node.js/Express backend, SQLite database, and a comprehensive design system mirroring Chase's design language.

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|

| React | 18.2+ | Component-based UI framework |
| TypeScript | 5.3+ | Type-safe development |
| Vite | 5.0+ | Fast build tool and dev server |
| Tailwind CSS | 3.4+ | Utility-first CSS framework |
| React Router | 6.20+ | Client-side routing |
| Axios | 1.6+ | HTTP client for API communication |
| React Hook Form | 7.49+ | Form state management |
| Zod | 3.22+ | Schema validation |
| Lucide React | 0.300+ | Icon library |
| date-fns | 3.0+ | Date formatting utilities |

### Backend

| Technology | Version | Purpose |

|------------|---------|---------|
| Node.js | 20.x LTS | Runtime environment |
| Express | 4.18+ | Web application framework |
| TypeScript | 5.3+ | Type-safe development |
| SQLite3 | 5.1+ | Embedded relational database |
| Better-SQLite3 | 9.2+ | Synchronous SQLite driver |
| bcryptjs | 2.4+ | Password hashing |
| jsonwebtoken | 9.0+ | JWT authentication |
| speakeasy | 2.0+ | TOTP/OTP generation |
| qrcode | 1.5+ | QR code generation for OTP |
| cors | 2.8+ | CORS middleware |
| helmet | 7.1+ | Security headers |
| express-rate-limit | 7.1+ | Rate limiting |

### Development Tools

| Tool | Purpose |

|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Husky | Git hooks |
| concurrently | Run multiple commands |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React Application (Vite)                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │   │
│  │  │  Pages   │ │Components│ │  Hooks   │ │  Services  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │   │
│  │  │  Auth    │ │  State   │ │  Types   │ │  Utils     │  │   │
│  │  │ Context  │ │ Management│ │          │ │            │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                        HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER (Node.js)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Express Application                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │   │
│  │  │  Routes  │ │Controllers│ │ Middleware│ │  Services  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │   │
│  │  │  Models  │ │  Database │ │  Auth    │ │  Utils     │  │   │
│  │  │          │ │  (SQLite) │ │  (JWT)   │ │            │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (SQLite)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   users     │ │  accounts   │ │transactions │ │  sessions │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

### 4.1 Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    otp_secret VARCHAR(32),
    otp_enabled BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 4.2 Accounts Table

```sql
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings')),
    account_number VARCHAR(20) UNIQUE NOT NULL,
    routing_number VARCHAR(9) NOT NULL,
    balance DECIMAL(12, 2) DEFAULT 0.00,
    available_balance DECIMAL(12, 2) DEFAULT 0.00,
    nickname VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4.3 Transactions Table

```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('debit', 'credit', 'transfer_in', 'transfer_out')),
    category VARCHAR(50),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    reference_number VARCHAR(30) UNIQUE NOT NULL,
    counterparty_account_id INTEGER,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (counterparty_account_id) REFERENCES accounts(id) ON DELETE SET NULL
);
```

### 4.4 Sessions Table

```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4.5 Indexes

```sql
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
```

---

## 5. API Endpoints

### 5.1 Authentication

| Method | Endpoint | Description |

|--------|----------|-------------|
| POST | `/api/auth/login` | User login with username/password |
| POST | `/api/auth/login/2fa` | Second factor authentication (OTP) |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/setup-2fa` | Setup 2FA (generate secret + QR) |
| POST | `/api/auth/verify-2fa` | Verify and enable 2FA |
| POST | `/api/auth/disable-2fa` | Disable 2FA |

### 5.2 Accounts

| Method | Endpoint | Description |

|--------|----------|-------------|
| GET | `/api/accounts` | List user's accounts |
| GET | `/api/accounts/:id` | Get account details |
| GET | `/api/accounts/:id/balance` | Get real-time balance |

### 5.3 Transactions

| Method | Endpoint | Description |

|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (paginated, filterable) |
| GET | `/api/transactions/:id` | Get transaction details |
| POST | `/api/transactions/transfer` | Initiate transfer between accounts |

### 5.4 Admin (Requires admin role)

| Method | Endpoint | Description |

|--------|----------|-------------|
| GET | `/api/admin/users` | List all users (paginated) |
| GET | `/api/admin/users/:id` | Get user details |
| POST | `/api/admin/users` | Create new user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| PUT | `/api/admin/users/:id/balance` | Update user account balance |
| POST | `/api/admin/users/:id/transactions` | Inject transaction |
| PUT | `/api/admin/transactions/:id` | Update transaction |
| DELETE | `/api/admin/transactions/:id` | Delete transaction |

---

## 6. Frontend Architecture

### 6.1 Project Structure

```
src/
├── assets/              # Static assets (fonts, images)
├── components/          # Reusable UI components
│   ├── ui/              # Base design system components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Toast.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts
│   ├── layout/          # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── forms/           # Form components
│   │   ├── LoginForm.tsx
│   │   ├── TransferForm.tsx
│   │   └── TransactionFilters.tsx
│   └── data-display/    # Data display components
│       ├── AccountCard.tsx
│       ├── TransactionRow.tsx
│       ├── BalanceDisplay.tsx
│       └── TransactionTable.tsx
├── pages/               # Page components
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── TwoFactor.tsx
│   │   └── Setup2FA.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── Accounts.tsx
│   │   └── Transactions.tsx
│   ├── transfers/
│   │   └── Transfer.tsx
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── Users.tsx
│   │   ├── UserDetail.tsx
│   │   └── Transactions.tsx
│   └── NotFound.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useAccounts.ts
│   ├── useTransactions.ts
│   ├── useTransfer.ts
│   └── useAdmin.ts
├── services/            # API services
│   ├── api.ts           # Axios instance
│   ├── auth.ts
│   ├── accounts.ts
│   ├── transactions.ts
│   └── admin.ts
├── store/               # State management (React Context)
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── types/               # TypeScript types
│   ├── user.ts
│   ├── account.ts
│   ├── transaction.ts
│   └── api.ts
├── utils/               # Utility functions
│   ├── format.ts
│   ├── validation.ts
│   └── constants.ts
├── styles/              # Global styles
│   ├── globals.css
│   └── tailwind.css
├── App.tsx
├── main.tsx
└── routes.tsx
```

### 6.2 Design System - Chase Bank Style

#### Color Palette

```css
/* Primary Chase Blue */
--chase-blue-50: #eff6ff;
--chase-blue-100: #dbeafe;
--chase-blue-500: #3b82f6;
--chase-blue-600: #2563eb;  /* Primary */
--chase-blue-700: #1d4ed8;
--chase-blue-800: #1e40af;
--chase-blue-900: #1e3a8a;

/* Chase Dark Blue */
--chase-dark-900: #002147;  /* Primary dark */
--chase-dark-800: #003366;
--chase-dark-700: #004080;

/* Neutrals */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Semantic Colors */
--success-500: #10b981;
--success-600: #059669;
--warning-500: #f59e0b;
--warning-600: #d97706;
--error-500: #ef4444;
--error-600: #dc2626;
```

#### Typography

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### Spacing System

```css
/* 4px base unit */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

#### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;
```

#### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

---

## 7. Security Considerations

### 7.1 Authentication & Authorization

- JWT-based stateless authentication with short-lived access tokens (15 min)
- Refresh tokens stored in httpOnly cookies (7 days)
- bcrypt with cost factor 12 for password hashing
- TOTP-based 2FA using RFC 6238
- Role-based access control (RBAC) for admin routes

### 7.2 API Security

- Helmet.js for security headers
- CORS configured for specific origins
- Rate limiting: 100 req/min for general, 10 req/min for auth
- Input validation with Zod schemas
- SQL injection prevention via parameterized queries

### 7.3 Frontend Security

- Content Security Policy headers
- XSS prevention via React's built-in escaping
- Secure cookie flags (Secure, SameSite=Strict)
- No sensitive data in localStorage

---

## 8. Deployment Architecture

### 8.1 Development

```
Frontend: Vite dev server (port 5173)
Backend:  tsx watch (port 3001)
Database: SQLite file (./data/chase.db)
```

### 8.2 Production

```
Frontend: Static files served by Nginx
Backend:  Node.js with PM2 (cluster mode)
Database: SQLite with WAL mode enabled
Reverse Proxy: Nginx (SSL termination, rate limiting)
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Project setup with Vite + Express + TypeScript
- [ ] Database schema and migrations
- [ ] Basic Express server with middleware
- [ ] Authentication system (JWT + bcrypt)

### Phase 2: Core Features (Week 2)

- [ ] User dashboard with accounts
- [ ] Transaction listing with pagination
- [ ] Transfer functionality
- [ ] 2FA setup and verification

### Phase 3: Admin Panel (Week 3)

- [ ] User management CRUD
- [ ] Balance manipulation
- [ ] Transaction injection/editing
- [ ] Admin-specific UI

### Phase 4: Polish & UX (Week 4)

- [ ] Chase design system implementation
- [ ] Responsive design
- [ ] Loading states & error handling
- [ ] Toast notifications
- [ ] Form validation

### Phase 5: Testing & Deployment (Week 5)

- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] E2E tests for critical flows
- [ ] Production build optimization
- [ ] Deployment configuration

---

## 10. Code Quality Standards

### 10.1 TypeScript Configuration

- Strict mode enabled
- No implicit any
- Strict null checks
- No unused locals/parameters

### 10.2 ESLint Rules

- Airbnb TypeScript style guide
- React hooks exhaustive-deps
- Import order enforcement
- Unused vars detection

### 10.3 Git Workflow

- Conventional commits
- Feature branches from main
- PR reviews required
- CI/CD pipeline on push

---

## 11. API Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Pagination Meta

```json
{
  "page": 1,
  "limit": 20,
  "total": 100,
  "totalPages": 5
}
```

---

## 12. Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=12
DATABASE_PATH=./data/chase.db
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Chase Bank
```

---

## 13. Future Enhancements

1. **Real-time Updates**: WebSocket integration for live balance updates
2. **Mobile App**: React Native companion app
3. **Advanced Analytics**: Spending insights and budgeting tools
4. **Bill Pay**: Recurring payment scheduling
5. **Investment Accounts**: Brokerage integration
6. **Open Banking**: Plaid/API integration for external accounts
7. **Audit Logging**: Comprehensive admin action logging
8. **Multi-language**: i18n support

---

*Document Version: 1.0*
*Last Updated: 2024*
*Author: Senior Software Architect*
