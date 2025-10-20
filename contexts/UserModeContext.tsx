import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

type UserMode = 'client' | 'agent';

const USER_MODE_KEY = '@user_mode';

export const [UserModeProvider, useUserMode] = createContextHook(() => {
  const [mode, setMode] = useState<UserMode>('client');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMode();
  }, []);

  const loadMode = async () => {
    try {
      const storedMode = await AsyncStorage.getItem(USER_MODE_KEY);
      if (storedMode === 'client' || storedMode === 'agent') {
        setMode(storedMode);
      }
    } catch (error) {
      console.error('Failed to load user mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = useCallback(async (newMode: UserMode) => {
    try {
      await AsyncStorage.setItem(USER_MODE_KEY, newMode);
      setMode(newMode);
      console.log('Switched to', newMode, 'mode');
    } catch (error) {
      console.error('Failed to switch mode:', error);
    }
  }, []);

  const isClient = mode === 'client';
  const isAgent = mode === 'agent';

  return useMemo(() => ({
    mode,
    isClient,
    isAgent,
    switchMode,
    isLoading,
  }), [mode, isClient, isAgent, switchMode, isLoading]);
});
