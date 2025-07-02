# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Wait for the project to be set up (usually takes 2-3 minutes)

## 2. Get Your Project Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

## 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 4. Set Up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database/schema.sql`
3. Run the query to create all tables, functions, and policies
4. Optionally, run `database/seed.sql` to add sample data

## 5. Configure Authentication

### Email Authentication
Email authentication is enabled by default in Supabase.

### Google OAuth Setup

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
   - Set application type to "Web application"
   - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase
5. Add the credentials to your `.env.local`:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 6. Configure Row Level Security (RLS)

The schema includes RLS policies that:
- Allow users to view all public data (profiles, communities, challenges, submissions)
- Restrict users to only modify their own data
- Allow community leaders to manage their communities and challenges
- Ensure data privacy and security

## 7. Test the Setup

1. Start your Next.js development server: `npm run dev`
2. Try signing up with email
3. Try signing in with Google (if configured)
4. Check that user profiles are created automatically

## Database Schema Overview

### Core Tables:
- `profiles` - User profiles (extends Supabase auth.users)
- `communities` - Interest-based communities
- `community_memberships` - User-community relationships
- `challenges` - Weekly challenges for communities
- `submissions` - User submissions to challenges
- `votes` - Voting system for submissions
- `reputation_history` - Track reputation point changes
- `badges` - Achievement system
- `user_badges` - User-badge relationships
- `notifications` - User notifications

### Key Features:
- Automatic user profile creation on signup
- Community member count tracking
- Submission vote count tracking
- Reputation point system
- Badge achievement system
- Comprehensive notification system

## Security Notes

- All tables have Row Level Security enabled
- Users can only access and modify their own data
- Community leaders have additional permissions for their communities
- Service role key should never be exposed to the client
- All database operations go through Supabase's secure API

