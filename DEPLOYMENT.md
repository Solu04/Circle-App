# Circle Platform - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Supabase project set up with database schema
- Domain name (optional)
- Vercel account (recommended) or hosting provider

### Step 1: Supabase Setup

1. **Create Supabase Project**
   ```
   1. Go to https://supabase.com
   2. Create new project
   3. Wait for database to initialize
   ```

2. **Run Database Schema**
   ```sql
   -- Copy and paste the contents of database/schema.sql
   -- into the Supabase SQL editor and execute
   ```

3. **Configure Authentication**
   ```
   1. Go to Authentication > Settings
   2. Enable email authentication
   3. Configure Google OAuth (optional):
      - Add Google OAuth credentials
      - Set redirect URL: https://your-project.supabase.co/auth/v1/callback
   ```

4. **Get Environment Variables**
   ```
   Project URL: https://your-project.supabase.co
   Anon Key: Found in Settings > API
   Service Role Key: Found in Settings > API (keep secret)
   ```

### Step 2: Vercel Deployment

1. **Connect Repository**
   ```
   1. Push code to GitHub
   2. Go to https://vercel.com
   3. Import your GitHub repository
   ```

2. **Configure Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_random_secret
   ```

3. **Deploy**
   ```
   1. Click "Deploy"
   2. Wait for build to complete
   3. Your app will be live at https://your-app.vercel.app
   ```

### Step 3: Post-Deployment Setup

1. **Update Supabase Auth Settings**
   ```
   1. Go to Authentication > Settings
   2. Add your Vercel URL to "Site URL"
   3. Add to "Redirect URLs" if using OAuth
   ```

2. **Test Core Features**
   - [ ] User registration/login
   - [ ] Community browsing
   - [ ] Challenge viewing
   - [ ] Responsive design

### Alternative Deployment Options

#### Netlify
```bash
npm run build
# Upload .next folder to Netlify
```

#### Self-Hosted
```bash
npm run build
npm start
# Runs on port 3000
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXTAUTH_URL` | Your app's URL | Yes |
| `NEXTAUTH_SECRET` | Random secret string | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | No |

### Performance Optimization

1. **Enable Caching**
   ```javascript
   // next.config.js
   const nextConfig = {
     experimental: {
       optimizeCss: true,
     },
   }
   ```

2. **Image Optimization**
   - Use Next.js Image component
   - Configure image domains in next.config.js

3. **Database Optimization**
   - Enable connection pooling in Supabase
   - Add database indexes for frequently queried fields

### Monitoring and Analytics

1. **Vercel Analytics**
   ```bash
   npm install @vercel/analytics
   ```

2. **Supabase Monitoring**
   - Monitor database performance
   - Set up alerts for errors

### Security Checklist

- [ ] Environment variables are secure
- [ ] RLS policies are enabled
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] API keys are not exposed in client code

### Troubleshooting

**Build Errors**
- Check environment variables
- Verify all dependencies are installed
- Review build logs

**Database Connection Issues**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure database is accessible

**Authentication Problems**
- Check OAuth configuration
- Verify redirect URLs
- Test with different browsers

### Scaling Considerations

**Database**
- Monitor connection limits
- Consider read replicas for high traffic
- Implement caching strategies

**Frontend**
- Use CDN for static assets
- Implement code splitting
- Monitor Core Web Vitals

### Backup Strategy

1. **Database Backups**
   - Supabase provides automatic backups
   - Consider additional backup solutions for critical data

2. **Code Backups**
   - Use Git for version control
   - Tag releases for easy rollback

### Support and Maintenance

**Regular Tasks**
- Monitor application performance
- Update dependencies
- Review security alerts
- Backup database regularly

**Emergency Procedures**
- Have rollback plan ready
- Monitor error rates
- Set up alerting for critical issues

---

## 🎉 Congratulations!

Your Circle platform is now live and ready for users to join communities, participate in challenges, and showcase their skills!

**Next Steps:**
1. Create initial communities
2. Invite beta users
3. Monitor usage and feedback
4. Plan feature enhancements

