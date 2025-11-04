# Hecate Server

A secure secret management system built with Next.js, Supabase, and TypeScript. This application allows users to authenticate with Google OAuth and manage their secret keys securely.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 🔑 **Secret Management** - Store and manage secret keys
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
│   │   └── secrets/route.ts        # Secret CRUD operations
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

   Create the `user_secrets` table in your Supabase database:
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

### Authentication

- **POST** `/api/auth/login` - Initiate Google OAuth login
- **GET** `/api/auth/user` - Verify JWT token and get user info

### Secrets Management

- **GET** `/api/secrets` - Fetch all secrets for authenticated user
- **POST** `/api/secrets` - Create a new secret

All API endpoints require JWT authentication via `Authorization: Bearer <token>` header.

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

