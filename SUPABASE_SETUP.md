# Supabase Authentication Setup

This guide explains how to configure Supabase authentication for the EtherialSoul application.

## Prerequisites

1. A Supabase account and project
2. Your Supabase project URL and API keys

## Configuration Steps

### 1. Client Setup

Create a `.env` file in the client root directory with your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-publishable-anon-key
```

**Important:** Based on the screenshot provided, use:
- **Publishable key** (starts with `sb_publishable_...`) for `SUPABASE_ANON_KEY`
- Your Supabase project URL for `SUPABASE_URL`

### 2. Server Setup

Add the following to your server's `.env` file:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
```

**Important:** 
- The `SUPABASE_JWT_SECRET` is found in your Supabase project settings under API > JWT Settings
- This is different from the API keys shown in the screenshot

### 3. Finding Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the following:
   - **Project URL** → Use for `SUPABASE_URL`
   - **Publishable anon key** (from screenshot) → Use for `SUPABASE_ANON_KEY`
   - **JWT Secret** (in JWT Settings section) → Use for `SUPABASE_JWT_SECRET`

## Features

### Client Features

- **Login/Register Modal**: Click the "Login" button in the app header to open the authentication modal
- **Session Management**: Automatic session persistence and restoration
- **Socket Authentication**: WebSocket connections include authentication tokens when user is logged in
- **Auto-reconnection**: Socket automatically reconnects with new auth token on login/logout

### Server Features

- **JWT Validation**: Validates Supabase JWT tokens on WebSocket connections
- **Optional Authentication**: Server works with or without authentication configured
- **User Context**: Authenticated user information available in socket handlers

## Usage

### For Users

1. Click the **Login** button in the app header
2. Choose to login or register
3. Enter your email and password
4. After successful authentication, you'll be logged in
5. Click **Выйти** (Logout) to sign out

### For Developers

The authentication state is available throughout the app via the `useAuth` hook:

```javascript
import { useAuth } from './src/contexts/AuthContext';

function MyComponent() {
    const { user, session, loading, signIn, signUp, signOut } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div>
            {user ? `Logged in as ${user.email}` : 'Not logged in'}
        </div>
    );
}
```

## Security Notes

- Never commit `.env` files to version control
- The publishable anon key is safe to use in client-side code
- The JWT secret should only be used on the server
- Supabase handles password hashing and security automatically

## Troubleshooting

### "Cannot find package '@supabase/supabase-js'"
Run `npm install` in both client and server directories.

### "Invalid JWT"
Ensure your `SUPABASE_JWT_SECRET` matches the JWT secret in your Supabase project settings.

### Socket not authenticating
Check that the client is properly configured with `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
