# Hecate Server

A secure secret management system built with Next.js, Supabase, and TypeScript. This application allows users to authenticate with Google OAuth and manage their secret keys securely.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 🔑 **Secret Management** - Store and manage secret keys
- 🔓 **API Key Access** - Generate API keys for client library access
- 🎨 **Modern UI** - Dark theme with Tailwind CSS
- 🛡️ **API Backend** - All database operations handled server-side
- 🔒 **JWT Authentication** - Secure API endpoints with JWT tokens
- ⚡ **Real-time Updates** - Instant UI updates after operations

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **Icons**: React Icons (Feather Icons)

## Project Structure

```
hecate-server/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # OAuth login endpoint
│   │   │   └── user/route.ts       # User authentication check
│   │   ├── apikey/route.ts         # API key generation & retrieval
│   │   ├── v1/
│   │   │   └── secrets/route.ts    # Public API for client library
│   │   └── secrets/route.ts        # Secret CRUD operations (JWT auth)
│   ├── auth/
│   │   └── callback/page.tsx       # OAuth callback handler
│   ├── profile/
│   │   └── page.tsx                # User profile & secrets management
│   ├── page.tsx                    # Landing/login page
│   └── layout.tsx                  # Root layout
├── lib/
│   └── supabaseClient.ts           # Supabase client configuration
└── public/
    └── google-logo.svg             # Google logo for login button
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Google OAuth credentials configured in Supabase

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chamesh2019/hecate-server.git
   cd hecate-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**

   Create the required tables in your Supabase database:

   **User Secrets Table:**
   ```sql
   CREATE TABLE user_secrets (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     key TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE user_secrets ENABLE ROW LEVEL SECURITY;

   -- Create policy to allow users to read their own secrets
   CREATE POLICY "Users can view their own secrets"
     ON user_secrets FOR SELECT
     USING (auth.uid() = user_id);

   -- Create policy to allow users to insert their own secrets
   CREATE POLICY "Users can insert their own secrets"
     ON user_secrets FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Create policy to allow users to delete their own secrets
   CREATE POLICY "Users can delete their own secrets"
     ON user_secrets FOR DELETE
     USING (auth.uid() = user_id);
   ```

   **API Keys Table:**
   ```sql
   CREATE TABLE api_keys (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     key TEXT NOT NULL UNIQUE,
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create index for faster lookups
   CREATE INDEX idx_api_keys_key ON api_keys(key) WHERE active = true;
   CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

   -- Enable Row Level Security
   ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

   -- Create policy to allow users to read their own API keys
   CREATE POLICY "Users can view their own API keys"
     ON api_keys FOR SELECT
     USING (auth.uid() = user_id);

   -- Create policy to allow users to insert their own API keys
   CREATE POLICY "Users can insert their own API keys"
     ON api_keys FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Create policy to allow users to update their own API keys
   CREATE POLICY "Users can update their own API keys"
     ON api_keys FOR UPDATE
     USING (auth.uid() = user_id);
   ```

5. **Configure Google OAuth in Supabase**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials
   - Add authorized redirect URL: `http://localhost:3000/auth/callback`

### Running the Application

**Development mode:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Production build:**
```bash
npm run build
npm start
```

**Linting:**
```bash
npm run lint
```

## API Endpoints

### Authentication (JWT Required)

- **POST** `/api/auth/login` - Initiate Google OAuth login
- **GET** `/api/auth/user` - Verify JWT token and get user info

### API Key Management (JWT Required)

- **GET** `/api/apikey` - Get or generate user's API key
- **POST** `/api/apikey` - Regenerate user's API key (invalidates old key)

### Secrets Management (JWT Required)

- **GET** `/api/secrets` - Fetch all secrets for authenticated user
- **POST** `/api/secrets` - Create a new secret

### Public API (API Key Required)

- **GET** `/api/v1/secrets` - Fetch all secrets (requires `x-api-key` header)
- **GET** `/api/v1/secrets?name=SECRET_NAME` - Fetch specific secret by name

**Usage with Client Library:**
```javascript
// Fetch all secrets
const response = await fetch('http://localhost:3000/api/v1/secrets', {
  headers: {
    'x-api-key': 'hk_your_api_key_here'
  }
});

// Fetch a specific secret
const response = await fetch('http://localhost:3000/api/v1/secrets?name=DATABASE_URL', {
  headers: {
    'x-api-key': 'hk_your_api_key_here'
  }
});
```

All `/api/auth`, `/api/apikey`, and `/api/secrets` endpoints require JWT authentication via `Authorization: Bearer <token>` header.

The `/api/v1/secrets` endpoint requires an API key via `x-api-key` header for client library access.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Security Features

- ✅ JWT token-based authentication
- ✅ Server-side API for all database operations
- ✅ Row Level Security (RLS) policies in Supabase
- ✅ Secure token storage in localStorage
- ✅ Authorization checks on all API endpoints

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Author

**Chamesh** - [@chamesh2019](https://github.com/chamesh2019)

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React Icons](https://react-icons.github.io/react-icons/) - Icons

