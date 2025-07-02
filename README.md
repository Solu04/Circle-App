# Circle - Community Challenge Platform

A modern community-based streaming platform built with Next.js and Supabase where users can join interest-based communities, participate in weekly challenges, and showcase their skills through livestreams and videos.

## 🚀 Features

### Core Features
- **User Authentication**: Email/password and Google OAuth integration
- **Community Management**: Join/leave communities, browse by interests
- **Weekly Challenges**: Create and participate in time-limited challenges
- **Content Submission**: Submit livestream links or video URLs
- **Voting System**: Vote on submissions and build reputation
- **User Profiles**: Track reputation, badges, and activity

### Technical Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live member counts and vote updates
- **Modern UI/UX**: Smooth animations, hover effects, and professional styling
- **Security**: Row Level Security (RLS) with Supabase
- **Performance**: Optimized with Next.js 15 and Turbopack

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Supabase Auth with Google OAuth
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google OAuth credentials (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd circle-platform
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Optionally run seed data from `database/seed.sql`
4. Configure authentication providers in Supabase dashboard

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
circle-platform/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── challenges/        # Challenge pages
│   │   ├── communities/       # Community pages
│   │   └── profile/           # User profile
│   ├── components/            # Reusable UI components
│   ├── context/               # React contexts
│   ├── features/              # Feature-specific components
│   │   ├── auth/              # Authentication components
│   │   ├── challenges/        # Challenge components
│   │   └── community/         # Community components
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utilities and configurations
├── database/                  # Database schema and seeds
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🗄️ Database Schema

The platform uses 10 main tables:

- **users**: User profiles and authentication
- **communities**: Interest-based communities
- **community_members**: User-community relationships
- **challenges**: Weekly challenges
- **submissions**: User challenge submissions
- **votes**: Voting on submissions
- **badges**: Achievement system
- **user_badges**: User badge assignments
- **notifications**: User notifications
- **leaderboards**: Community rankings

## 🔐 Authentication Setup

### Email Authentication
Email authentication is enabled by default in Supabase.

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
4. Add credentials to Supabase Auth settings
5. Update environment variables

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing

### Local Testing
```bash
# Run development server
npm run dev

# Build and test production build
npm run build
npm start
```

### Feature Testing Checklist

- [ ] User registration and login
- [ ] Community browsing and joining
- [ ] Challenge creation and participation
- [ ] Content submission (video/livestream)
- [ ] Voting on submissions
- [ ] Profile management
- [ ] Responsive design on mobile
- [ ] Authentication flows

## 🔧 Configuration

### Supabase Configuration

1. **Row Level Security**: Enabled on all tables
2. **Authentication**: Email and OAuth providers
3. **Real-time**: Enabled for live updates
4. **Storage**: For user avatars and community images

### Next.js Configuration

- **App Router**: Using Next.js 15 App Router
- **Turbopack**: Enabled for faster development
- **TypeScript**: Disabled (using JavaScript)
- **ESLint**: Enabled for code quality

## 📱 Mobile Support

The platform is fully responsive and supports:

- **Touch Navigation**: Mobile-friendly navigation
- **Responsive Layout**: Adapts to all screen sizes
- **Mobile Forms**: Optimized form inputs
- **Touch Interactions**: Proper touch targets

## 🎨 Customization

### Styling
- Modify `src/app/globals.css` for global styles
- Update Tailwind config in `tailwind.config.js`
- Customize components in `src/components/`

### Features
- Add new challenge types in `src/features/challenges/`
- Extend community features in `src/features/community/`
- Modify database schema in `database/schema.sql`

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check environment variables
   - Verify Supabase project URL and keys

2. **Authentication Not Working**
   - Check OAuth configuration
   - Verify redirect URLs

3. **Database Errors**
   - Ensure RLS policies are set up
   - Check user permissions

### Debug Mode

Enable debug logging:
```env
NEXT_PUBLIC_DEBUG=true
```

## 📚 API Reference

### Database Functions

```javascript
// User operations
await createUserProfile(userData)
await getUserProfile(userId)
await updateUserProfile(userId, updates)

// Community operations
await getCommunities()
await joinCommunity(userId, communityId)
await leaveCommunity(userId, communityId)

// Challenge operations
await getActiveChallenges()
await createChallenge(challengeData)
await getChallengeSubmissions(challengeId)

// Submission operations
await createSubmission(submissionData)
await voteForSubmission(userId, submissionId)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the troubleshooting section
2. Review Supabase documentation
3. Check Next.js documentation
4. Create an issue in the repository

## 🔮 Future Enhancements

- [ ] Real-time chat in communities
- [ ] Advanced badge system
- [ ] Community leaderboards
- [ ] Mobile app (React Native)
- [ ] Video upload support
- [ ] Advanced analytics
- [ ] Monetization features
- [ ] API for third-party integrations

---

Built with ❤️ using Next.js and Supabase

