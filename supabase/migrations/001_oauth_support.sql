-- Migration: Add support for Google OAuth authentication
-- Run this in your Supabase SQL Editor if you have an existing database

-- Step 1: Make email column nullable for anonymous users
ALTER TABLE public.users
ALTER COLUMN email DROP NOT NULL;

-- Step 2: Update the handle_new_user function to handle both OAuth and anonymous users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, NULL));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Add INSERT policy for users table (allows users to create their own record)
CREATE POLICY "Users can insert own record" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Note: After running this migration, you also need to:
-- 1. Enable Google OAuth provider in Supabase Dashboard -> Authentication -> Providers
-- 2. Add your Google OAuth Client ID and Secret
-- 3. Configure the redirect URL in Google Cloud Console
