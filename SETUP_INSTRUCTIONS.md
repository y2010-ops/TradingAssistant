# 🚨 URGENT: Supabase Setup Required

The application is currently using placeholder Supabase credentials and cannot connect to a real database. Follow these steps to fix the connection:

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `trading-assistant` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose closest to your location
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API keys** → **anon public** key
   - **Project API keys** → **service_role** key (keep this secret!)

## Step 3: Update Your .env File

Replace the placeholder values in your `.env` file with your real Supabase credentials:

```env
# Replace these with your actual values from Step 2
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
SUPABASE_DB_URL=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres
```

## Step 4: Set Up Database Schema

After updating your `.env` file, you need to run the database migrations to create the required tables:

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the migration file located at `supabase/migrations/20250704040629_cold_shrine.sql`
3. Or use the Supabase CLI if you have it installed

## Step 5: Test the Connection

1. Save your `.env` file
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Try to sign up for a new account or sign in
4. The "Failed to fetch" error should be resolved

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your `service_role` key secret - it has admin access
- The `anon` key is safe to use in frontend code
- Use different projects for development and production

## 🆘 Need Help?

If you're still having issues:

1. Check that your Supabase project is active (not paused)
2. Verify the URL format: `https://your-project-ref.supabase.co`
3. Make sure you copied the keys correctly (no extra spaces)
4. Check the browser console for more detailed error messages

## 🎯 Quick Test

You can test your Supabase connection by running:
```bash
npm run test-db
```

This will verify that your credentials are working correctly.