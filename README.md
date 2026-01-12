# Travloger Frontend

Frontend application for Travloger Travel Agency Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file from `.env.local.example`:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your configuration:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (for client-side auth)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key (for client-side auth)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)

## Development

Run in development mode:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Production

Build and start:
```bash
npm run build
npm start
```

## Architecture

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Routing**: React Router DOM (client-side routing within ClientApp)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth (client-side) + Backend API for first-login checks
- **API Communication**: All API calls go to backend server via `NEXT_PUBLIC_API_URL`

## Login Flow

1. User enters credentials in LoginForm
2. AuthContext uses Supabase client to authenticate
3. After successful login, checks first-login status via backend API
4. If first login, shows ChangePasswordModal
5. ChangePasswordModal calls backend API to change password
6. User is redirected to appropriate dashboard based on role



