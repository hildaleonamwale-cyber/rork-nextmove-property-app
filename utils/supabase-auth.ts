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

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select()
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('Profile creation error:', profileError);
    throw new Error('Failed to create user profile');
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

  return { user };
}

export async function login(params: LoginParams): Promise<{ user: SupabaseUser }> {
  const { email, password } = params;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('Supabase login error:', authError);
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('No user returned from login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
    throw new Error('Failed to fetch user profile');
  }

  if (profile.blocked) {
    await supabase.auth.signOut();
    throw new Error('Your account has been blocked');
  }

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
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
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

export async function uploadAvatar(base64Image: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const fileName = `${session.user.id}-${Date.now()}.jpg`;
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
