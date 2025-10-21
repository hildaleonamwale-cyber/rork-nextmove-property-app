import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useUser } from './UserContext';

type UserMode = 'client' | 'agent';

const USER_MODE_KEY = '@user_mode';

export const [UserModeProvider, useUserMode] = createContextHook(() => {
  const { user, isAgent } = useUser();
  const [mode, setMode] = useState<UserMode>('client');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMode();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadMode = async () => {
    try {
      const storedMode = await AsyncStorage.getItem(USER_MODE_KEY);
      
      if (user && isAgent) {
        if (storedMode === 'client' || storedMode === 'agent') {
          setMode(storedMode);
        } else {
          setMode('agent');
          await AsyncStorage.setItem(USER_MODE_KEY, 'agent');
        }
      } else {
        setMode('client');
        await AsyncStorage.setItem(USER_MODE_KEY, 'client');
      }
    } catch (error) {
      console.error('Failed to load user mode:', error);
      setMode('client');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = useCallback(async (newMode: UserMode) => {
    try {
      console.log('Attempting to switch to', newMode, 'mode');
      console.log('isAgent:', isAgent);
      console.log('user:', user);
      
      if (newMode === 'agent' && !isAgent) {
        console.log('User is not an agent yet, but will allow mode switch for onboarding');
      }
      
      await AsyncStorage.setItem(USER_MODE_KEY, newMode);
      setMode(newMode);
      console.log('Successfully switched to', newMode, 'mode');
    } catch (error) {
      console.error('Failed to switch mode:', error);
    }
  }, [isAgent, user]);

  const isClient = mode === 'client';
  const isAgentMode = mode === 'agent';

  return useMemo(() => ({
    mode,
    isClient,
    isAgent: isAgentMode,
    switchMode,
    isLoading,
  }), [mode, isClient, isAgentMode, switchMode, isLoading]);
});
