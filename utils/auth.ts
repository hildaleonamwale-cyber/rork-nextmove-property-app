import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';
const REFRESH_TOKEN_KEY = '@refresh_token';

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'agent' | 'agency' | 'super_admin';
  accountTier?: 'free' | 'pro' | 'agency';
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    console.log('Auth token saved successfully');
  } catch (error) {
    console.error('Failed to save auth token:', error);
    throw error;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save refresh token:', error);
    throw error;
  }
}

export async function getUserData(): Promise<UserData | null> {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
}

export async function setUserData(userData: UserData): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    console.log('User data saved successfully');
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
}

export async function clearAuthData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      AUTH_TOKEN_KEY,
      USER_DATA_KEY,
      REFRESH_TOKEN_KEY,
    ]);
    console.log('Auth data cleared successfully');
  } catch (error) {
    console.error('Failed to clear auth data:', error);
    throw error;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null;
}

export async function isSuperAdmin(): Promise<boolean> {
  const userData = await getUserData();
  return userData?.role === 'super_admin';
}

export async function isAgent(): Promise<boolean> {
  const userData = await getUserData();
  return userData?.role === 'agent' || userData?.role === 'agency';
}
