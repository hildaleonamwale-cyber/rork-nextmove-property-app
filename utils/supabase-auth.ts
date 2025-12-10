import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role: 'client' | 'agent' | 'agency' | 'admin';
  verified: boolean;
  blocked: boolean;
  createdAt: Date | null;
  lastActive: Date | null;
}

export interface SignupParams {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

const USER_PROFILE_KEY = '@user_profile';

async function ensureSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    throw new Error('Session error: ' + error.message);
  }
  
  if (!session) {
    console.error('No active session found');
    throw new Error('No active session. Please log in again.');
  }
  
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at || 0;
  const timeUntilExpiry = expiresAt - now;
  
  if (timeUntilExpiry < 300) {
    console.log('Session expiring soon, refreshing...');
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !refreshedSession) {
      console.error('Session refresh failed:', refreshError);
      await supabase.auth.signOut();
      await AsyncStorage.removeItem(USER_PROFILE_KEY);
      throw new Error('Session expired. Please log in again.');
    }
    
    return refreshedSession;
  }
  
  return session;
}

export async function signup(params: SignupParams): Promise<{ user: SupabaseUser }> {
  const { email, password, name, phone } = params;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone: phone || null,
      },
    },
  });

  if (authError) {
    console.error('Supabase signup error:', authError);
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('No user returned from signup');
  }

  console.log('Auth user created, waiting for profile creation...');

  let profile = null;
  let attempts = 0;
  const maxAttempts = 15;
  const baseDelay = 300;

  while (!profile && attempts < maxAttempts) {
    attempts++;
    
    const delay = baseDelay * Math.min(attempts, 3);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    console.log(`Checking for profile... attempt ${attempts}/${maxAttempts}`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (data) {
      profile = data;
      console.log('Profile found after', attempts, 'attempts');
      break;
    }

    if (error && !error.message.includes('No rows')) {
      console.error('Profile fetch error:', error);
    }
  }

  if (!profile) {
    console.error('Profile creation timeout after', maxAttempts, 'attempts');
    throw new Error('Account created but profile setup is delayed. Please wait a moment and try logging in.');
  }

  const user: SupabaseUser = {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    avatar: profile.avatar,
    role: profile.role,
    verified: profile.verified,
    blocked: profile.blocked,
    createdAt: profile.created_at ? new Date(profile.created_at) : null,
    lastActive: profile.last_active ? new Date(profile.last_active) : null,
  };

  await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));

  console.log('Signup completed successfully');

  return { user };
}

export async function login(params: LoginParams): Promise<{ user: SupabaseUser }> {
  const { email, password } = params;

  console.log('[Auth] Starting login for:', email);

  const authPromise = supabase.auth.signInWithPassword({
    email,
    password,
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Login timeout - please check your internet connection')), 15000);
  });

  const { data: authData, error: authError } = await Promise.race([
    authPromise,
    timeoutPromise,
  ]) as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

  if (authError) {
    console.error('[Auth] Login error:', authError);
    throw new Error(authError.message);
  }

  if (!authData.user) {
    console.error('[Auth] No user in response');
    throw new Error('No user returned from login');
  }

  console.log('[Auth] User authenticated, fetching profile...');

  const profilePromise = supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  const profileTimeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
  });

  const result = await Promise.race([
    profilePromise,
    profileTimeoutPromise,
  ]);

  const { data: profile, error: profileError } = result as { data: any; error: any };

  if (profileError) {
    console.error('[Auth] Profile fetch error:', profileError);
    throw new Error('Failed to fetch user profile');
  }

  if (!profile) {
    console.error('[Auth] No profile found');
    throw new Error('User profile not found');
  }

  if (profile.blocked) {
    console.log('[Auth] User is blocked, signing out');
    await supabase.auth.signOut();
    throw new Error('Your account has been blocked');
  }

  console.log('[Auth] Updating last active timestamp...');
  
  try {
    await supabase
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('id', authData.user.id);
    console.log('[Auth] Last active updated');
  } catch (err: any) {
    console.error('[Auth] Failed to update last active:', err);
  }

  const user: SupabaseUser = {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    avatar: profile.avatar,
    role: profile.role,
    verified: profile.verified,
    blocked: profile.blocked,
    createdAt: profile.created_at ? new Date(profile.created_at) : null,
    lastActive: new Date(),
  };

  console.log('[Auth] Caching user profile...');
  await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));

  console.log('[Auth] Login completed successfully');
  return { user };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  await AsyncStorage.removeItem(USER_PROFILE_KEY);
  await AsyncStorage.removeItem('@user_mode');
}

export async function getCurrentUser(skipCache: boolean = false): Promise<SupabaseUser | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
    return null;
  }

  if (!skipCache) {
    const cachedProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (cachedProfile) {
      const parsed = JSON.parse(cachedProfile);
      return {
        ...parsed,
        createdAt: parsed.createdAt ? new Date(parsed.createdAt) : null,
        lastActive: parsed.lastActive ? new Date(parsed.lastActive) : null,
      };
    }
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
    return null;
  }

  if (!profile) {
    console.error('Failed to fetch user profile: Profile not found');
    return null;
  }

  const user: SupabaseUser = {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    avatar: profile.avatar,
    role: profile.role,
    verified: profile.verified,
    blocked: profile.blocked,
    createdAt: profile.created_at ? new Date(profile.created_at) : null,
    lastActive: profile.last_active ? new Date(profile.last_active) : null,
  };

  await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));

  return user;
}

export async function updateProfile(updates: { name?: string; phone?: string }): Promise<SupabaseUser> {
  const session = await ensureSession();

  if (!session?.user) {
    throw new Error('Not authenticated. Please log in again.');
  }

  const { data: profile, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', session.user.id)
    .select()
    .single();

  if (error || !profile) {
    console.error('Failed to update profile:', error);
    throw new Error('Failed to update profile');
  }

  const user: SupabaseUser = {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    avatar: profile.avatar,
    role: profile.role,
    verified: profile.verified,
    blocked: profile.blocked,
    createdAt: profile.created_at ? new Date(profile.created_at) : null,
    lastActive: profile.last_active ? new Date(profile.last_active) : null,
  };

  await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));

  return user;
}

export async function clearUserCache(): Promise<void> {
  await AsyncStorage.removeItem(USER_PROFILE_KEY);
}

export async function uploadAvatar(base64Image: string): Promise<string> {
  const session = await ensureSession();

  if (!session?.user) {
    throw new Error('Not authenticated. Please log in again.');
  }

  const fileName = `${session.user.id}/avatar-${Date.now()}.jpg`;
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, decode(base64Data), {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    console.error('Avatar upload error:', uploadError);
    throw new Error('Failed to upload avatar');
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  const avatarUrl = urlData.publicUrl;

  await supabase
    .from('users')
    .update({ avatar: avatarUrl })
    .eq('id', session.user.id);

  return avatarUrl;
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
