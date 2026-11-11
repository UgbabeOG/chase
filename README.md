# Chase Bank Clone

A premium, high-fidelity banking web application that replicates the Chase Bank web platform's user interface and aesthetic experience.

## Features

### Client Features

- **Secure Login Interface** - Username/password authentication with optional 2FA (TOTP)
- **Dashboard** - Real-time balances for checking and savings accounts
- **Recent Transactions** - Detailed transaction history with filtering and pagination
- **Transfer Money** - Simulate bank transfers between accounts

### Admin Features

- **User Management** - Create, read, update, delete users
- **Balance Control** - Modify user account balances
- **Transaction Injection** - Manually create, edit, or delete transactions
- **Transaction Monitoring** - View all transactions across all users

### Technical Features

- **JWT Authentication** - Access tokens (15 min) + Refresh tokens (7 days)
- **Two-Factor Authentication** - TOTP with QR code setup and backup codes
- **Turso/libSQL Database** - SQLite-compatible persistent storage for deployed services, with a local file database for development
- **Role-Based Access Control** - User and Admin roles
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **TypeScript** - Full type safety across frontend and backend

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite 5 (build tool)
- Tailwind CSS 3 (styling)
- React Router 6 (routing)
- React Hook Form + Zod (forms/validation)
- Axios (API client)
- Lucide React (icons)
- date-fns (date formatting)

### Backend

- Node.js 20 + TypeScript
- Express 4 (web framework)
- Turso/libSQL (`@libsql/client`) database driver
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- speakeasy (TOTP)
- qrcode (QR code generation)
- Helmet (security headers)
- express-rate-limit (rate limiting)

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

```bash
# Install all dependencies
npm install

# Initialize database and seed demo data
npm run db:reset
```

### Development

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:client  # Frontend on http://localhost:5173
npm run dev:server  # Backend on http://localhost:3001
```

### Production Build

```bash
# Build both frontend and backend
npm run build

# Start production server
npm run start
```

### Vercel Deployment

The root `vercel.json` configures two services: the Vite client (`client`) and Express API (`server`). Requests under `/api/*` go to the API; all other paths go to the client. The client rewrites extensionless paths such as `/login` to the SPA entry point while leaving asset paths untouched. The client uses the same-origin `/api` path, so no service binding is needed.

The API requires a persistent Turso/libSQL database in Vercel. Add these variables to the Vercel project's **Production** environment:

- `TURSO_DATABASE_URL` — the URL of the existing Turso database.
- `TURSO_AUTH_TOKEN` — the authentication token for that database.

The server reads these values at runtime; they do not belong in `vercel.json` or any `VITE_*` client variable. From the repository root, link this checkout to the intended Vercel project, then add each variable using the CLI's interactive prompt:

```bash
npx vercel login
npx vercel link
npx vercel env add TURSO_DATABASE_URL --environment production
npx vercel env add TURSO_AUTH_TOKEN --environment production
npx vercel deploy --prod
```

Enter each value only at the CLI prompt; do not put secrets in command arguments, source files, or shell history. These production credentials should not be added to Preview deployments. If Preview deployments are needed, give them a separate Turso database and add its credentials to the Preview environment.

For local development, the API uses `server/data/chase.db` unless `TURSO_DATABASE_URL` is set. The one-time migration command loads `server/.env`:

To copy local SQLite records into a newly-created, empty Turso database, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in `server/.env`, then run:

```bash
npm run db:migrate:turso --workspace=server
```

The migration refuses to import if the target already contains users, accounts, transactions, or sessions. It preserves those tables' records and imports existing transaction policy settings. The existing Turso database has already been populated; do not rerun this migration or run `npm run db:reset` against it. Do not commit `.env` files; if credentials have been committed or shared, rotate them.

## Demo Credentials

After running `npm run db:seed`:

| Role | Username | Password |
|------|----------|----------|

| Admin | admin | admin123 |
| User | johndoe | password123 |

## Project Structure

```

chase-bank-clone/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Base design system components
│   │   │   ├── layout/     # Layout components (Header, Footer, etc.)
│   │   │   ├── forms/      # Form components
│   │   │   └── data-display/ # Data display components
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Authentication pages
│   │   │   ├── dashboard/  # Dashboard pages
│   │   │   ├── transfers/  # Transfer pages
│   │   │   └── admin/      # Admin pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── store/          # React Context state
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles
│   └── ...
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── db/             # Database initialization and seeding
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   └── ...
├── ARCHITECTURE.md         # Technical architecture document
└── package.json            # Root package.json with workspaces
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/login/2fa` - 2FA verification
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/setup-2fa` - Setup 2FA
- `POST /api/auth/verify-2fa` - Verify and enable 2FA
- `POST /api/auth/disable-2fa` - Disable 2FA

### Accounts

- `GET /api/accounts` - List user accounts
- `GET /api/accounts/:id` - Get account details
- `GET /api/accounts/:id/balance` - Get real-time balance

### Transactions

- `GET /api/transactions` - List transactions (paginated, filterable)
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions/transfer` - Initiate transfer

### Admin (requires admin role)

- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/balance` - Update account balance
- `POST /api/admin/users/:id/transactions` - Create transaction
- `GET /api/admin/transactions` - List all transactions
- `PUT /api/admin/transactions/:id` - Update transaction
- `DELETE /api/admin/transactions/:id` - Delete transaction

## Database Schema

- **users** - User accounts with authentication info
- **accounts** - Checking and savings accounts
- **transactions** - Transaction history
- **sessions** - Refresh token sessions

## Security

- JWT-based stateless authentication
- bcrypt password hashing (cost factor 12)
- TOTP-based 2FA (RFC 6238)
- Helmet.js security headers
- CORS configured for specific origins
- Rate limiting on auth endpoints
- Input validation with Zod
- SQL injection prevention via parameterized queries
- Secure cookie flags (HttpOnly, Secure, SameSite)

## License

MIT License - Feel free to use for learning and development purposes.
