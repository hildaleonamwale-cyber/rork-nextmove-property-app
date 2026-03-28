-- ============================================
-- SUPABASE AUTH TRIGGER FIX
-- This creates a trigger to automatically create a user profile
-- when a new user signs up through Supabase Auth
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    phone,
    password_hash,
    role,
    verified,
    blocked
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    '',  -- Empty password_hash since Supabase Auth handles passwords
    'client',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ADDITIONAL: Handle user updates from auth
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user email if it changed
  IF NEW.email != OLD.email THEN
    UPDATE public.users
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  
  -- Update verified status if email was confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.users
    SET verified = true
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create trigger for user updates
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

-- ============================================
-- CLEANUP: Handle user deletion
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create trigger for user deletion
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

-- ============================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant service role access to users table
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.agents TO service_role;
GRANT ALL ON public.properties TO service_role;
GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.wishlists TO service_role;
GRANT ALL ON public.staff TO service_role;
GRANT ALL ON public.managed_properties TO service_role;

-- Grant authenticated users access to necessary operations
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

DO $$
BEGIN
  RAISE NOTICE '✅ Auth triggers created successfully!';
  RAISE NOTICE '🔐 Users will now be automatically created when signing up';
  RAISE NOTICE '📝 Email verification status will sync automatically';
  RAISE NOTICE '🗑️  User deletion will cascade properly';
END $$;
