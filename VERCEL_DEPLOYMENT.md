# Vercel Deployment Guide

This guide will help you deploy the AI Trading Assistant to Vercel with proper configuration.

## Prerequisites

1. **Supabase Project**: You need a Supabase project set up
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and API keys from Settings → API
3. Note down:
   - Project URL (e.g., `https://your-project.supabase.co`)
   - Anon public key
   - Service role key (keep this secret)

## Step 2: Deploy to Vercel

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

2. **Configure Environment Variables**:
   - In the Vercel project settings, go to "Environment Variables"
   - Add the following variables:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Deploy Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Step 3: Configure Supabase Database

1. **Run Migrations**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the migration from `supabase/migrations/20250704040629_cold_shrine.sql`

2. **Set Up Authentication**:
   - Go to Authentication → Settings
   - Add your Vercel domain to the Site URL
   - Configure any additional auth settings

## Step 4: Test Deployment

1. **Check Build Logs**:
   - Monitor the build process in Vercel
   - Ensure no errors occur during build

2. **Test Functionality**:
   - Visit your deployed site
   - Test sign-up/sign-in functionality
   - Verify all features work correctly

## Environment Variables Reference

### Required Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

### Optional Variables (for enhanced features)
- `ALPHA_VANTAGE_API_KEY`: For real market data
- `FINNHUB_API_KEY`: For additional market data
- `POLYGON_API_KEY`: For Polygon.io data
- `NEWS_API_KEY`: For news feeds
- `OPENAI_API_KEY`: For AI features
- `ANTHROPIC_API_KEY`: For Claude AI features

## Troubleshooting

### Common Issues

1. **White Screen**:
   - Check browser console for errors
   - Verify environment variables are set correctly
   - Ensure Supabase credentials are valid

2. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation
   - Check for missing environment variables

3. **Authentication Issues**:
   - Verify Supabase URL and keys are correct
   - Check that your domain is added to Supabase auth settings
   - Ensure CORS is configured properly

### Debug Steps

1. **Check Console Logs**:
   - Open browser developer tools
   - Look for error messages in console
   - Check network tab for failed requests

2. **Verify Environment Variables**:
   - In Vercel dashboard, go to Environment Variables
   - Ensure all required variables are set
   - Check that values are correct (no extra spaces)

3. **Test Supabase Connection**:
   - Use the Supabase dashboard to test your connection
   - Verify that your project is active and not paused

## Production Checklist

- [ ] Environment variables configured
- [ ] Supabase database migrations run
- [ ] Authentication settings configured
- [ ] Domain added to Supabase auth
- [ ] Build completes successfully
- [ ] All features tested
- [ ] Error monitoring set up (optional)

## Support

If you encounter issues:

1. Check the browser console for specific error messages
2. Verify all environment variables are set correctly
3. Ensure your Supabase project is active
4. Check Vercel build logs for any build errors

For additional help, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) 