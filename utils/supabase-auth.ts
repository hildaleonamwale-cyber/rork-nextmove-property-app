import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
    console.error('[ensureSession] Error getting session:', error);
    throw new Error('Session error: ' + error.message);
  }
  
  if (!session) {
    console.error('[ensureSession] No active session found');
    throw new Error('No active session. Please log in again.');
  }
  
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at || 0;
  const timeUntilExpiry = expiresAt - now;
  
  if (timeUntilExpiry < 300) {
    console.log('[ensureSession] Session expiring soon, refreshing...');
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !refreshedSession) {
      console.error('[ensureSession] Session refresh failed:', refreshError);
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

  console.log('[supabase-auth] Signup attempt for:', email);

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
    console.error('[supabase-auth] Signup error:', authError);
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('No user returned from signup');
  }

  console.log('[supabase-auth] Auth user created, waiting for profile creation...');

  let profile = null;
  let attempts = 0;
  const maxAttempts = 15;
  const baseDelay = 300;

  while (!profile && attempts < maxAttempts) {
    attempts++;
    
    const delay = baseDelay * Math.min(attempts, 3);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    console.log(`[supabase-auth] Checking for profile... attempt ${attempts}/${maxAttempts}`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (data) {
      profile = data;
      console.log('[supabase-auth] Profile found after', attempts, 'attempts');
      break;
    }

    if (error && !error.message.includes('No rows')) {
      console.error('[supabase-auth] Profile fetch error:', error);
    }
  }

  if (!profile) {
    console.error('[supabase-auth] Profile creation timeout after', maxAttempts, 'attempts');
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
  console.log('[supabase-auth] Signup complete, user cached');

  return { user };
}

export async function login(params: LoginParams): Promise<{ user: SupabaseUser }> {
  const { email, password } = params;

  console.log('[supabase-auth] Login attempt for:', email, 'on platform:', Platform.OS);

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('[supabase-auth] Login error:', authError);
    throw new Error(authError.message);
  }

  if (!authData.user) {
    console.error('[supabase-auth] No user returned from login');
    throw new Error('No user returned from login');
  }

  console.log('[supabase-auth] Auth successful, session:', authData.session ? 'Active' : 'None');
  console.log('[supabase-auth] Fetching user profile...');

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('[supabase-auth] Profile fetch error:', profileError);
    throw new Error('Failed to fetch user profile');
  }

  console.log('[supabase-auth] Profile fetched:', profile.email, 'role:', profile.role);

  if (profile.blocked) {
    console.log('[supabase-auth] Account blocked');
    await supabase.auth.signOut();
    throw new Error('Your account has been blocked');
  }

  console.log('[supabase-auth] Updating last_active...');
  await supabase
    .from('users')
    .update({ last_active: new Date().toISOString() })
    .eq('id', authData.user.id);

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

  await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
  console.log('[supabase-auth] Login complete, user cached in AsyncStorage');

  return { user };
}

export async function logout(): Promise<void> {
  console.log('[supabase-auth] Logging out...');
  await supabase.auth.signOut();
  await AsyncStorage.removeItem(USER_PROFILE_KEY);
  await AsyncStorage.removeItem('@user_mode');
  console.log('[supabase-auth] Logout complete');
}

export async function getCurrentUser(skipCache: boolean = false): Promise<SupabaseUser | null> {
  console.log('[supabase-auth] getCurrentUser called, skipCache:', skipCache, 'platform:', Platform.OS);
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('[supabase-auth] Session error:', sessionError);
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
    return null;
  }

  if (!session) {
    console.log('[supabase-auth] No session found');
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
    return null;
  }

  console.log('[supabase-auth] Session found for:', session.user.email);
  console.log('[supabase-auth] Session expires:', new Date(session.expires_at! * 1000).toISOString());

  if (!skipCache) {
    const cachedProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (cachedProfile) {
      console.log('[supabase-auth] Using cached profile');
      try {
        const parsed = JSON.parse(cachedProfile);
        return {
          ...parsed,
          createdAt: parsed.createdAt ? new Date(parsed.createdAt) : null,
          lastActive: parsed.lastActive ? new Date(parsed.lastActive) : null,
        };
      } catch (error) {
        console.error('[supabase-auth] Error parsing cached profile:', error);
      }
    } else {
      console.log('[supabase-auth] No cached profile found');
    }
  }

  console.log('[supabase-auth] Fetching fresh profile from database...');

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('[supabase-auth] Error fetching user profile:', error);
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
    return null;
  }

  if (!profile) {
    console.error('[supabase-auth] Profile not found in database');
    return null;
  }

  console.log('[supabase-auth] Profile fetched from database:', profile.email);

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
  console.log('[supabase-auth] Profile cached in AsyncStorage');

  return user;
}

export async function updateProfile(updates: { name?: string; phone?: string }): Promise<SupabaseUser> {
  console.log('[supabase-auth] Updating profile...');
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
    console.error('[supabase-auth] Failed to update profile:', error);
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
  console.log('[supabase-auth] Profile update complete, cache updated');

  return user;
}

export async function clearUserCache(): Promise<void> {
  console.log('[supabase-auth] Clearing user cache...');
  await AsyncStorage.removeItem(USER_PROFILE_KEY);
}

export async function uploadAvatar(base64Image: string): Promise<string> {
  console.log('[supabase-auth] Uploading avatar...');
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
    console.error('[supabase-auth] Avatar upload error:', uploadError);
    throw new Error('Failed to upload avatar');
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  const avatarUrl = urlData.publicUrl;
  console.log('[supabase-auth] Avatar uploaded:', avatarUrl);

  await supabase
    .from('users')
    .update({ avatar: avatarUrl })
    .eq('id', session.user.id);

  console.log('[supabase-auth] Avatar URL saved to profile');
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
