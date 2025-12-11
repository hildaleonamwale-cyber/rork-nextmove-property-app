import { useState, useEffect, useMemo, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { getCurrentUser, updateProfile as updateProfileSupabase, uploadAvatar as uploadAvatarSupabase, SupabaseUser } from "@/utils/supabase-auth";
import { supabase } from "@/lib/supabase";

export type User = SupabaseUser;

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async (skipCache: boolean = false) => {
    try {
      console.log('[UserContext] Loading user, skipCache:', skipCache);
      setIsLoading(true);
      setError(null);
      const currentUser = await getCurrentUser(skipCache);
      console.log('[UserContext] User loaded:', currentUser ? currentUser.email : 'No user');
      setUser(currentUser);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserContext] Error loading user:', errorMessage);
      setError(errorMessage);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[UserContext] Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('[UserContext] Session active/refreshed, loading user...');
        await loadUser(true);
      } else if (event === 'SIGNED_OUT') {
        console.log('[UserContext] User signed out');
        setUser(null);
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUser]);

  const updateProfile = useCallback(
    async (updates: { name?: string; phone?: string }) => {
      try {
        setError(null);
        const updatedUser = await updateProfileSupabase(updates);
        setUser(updatedUser);
        return updatedUser;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
        console.error('Update profile error:', errorMessage);
        setError(errorMessage);
        throw error;
      }
    },
    []
  );

  const uploadAvatar = useCallback(
    async (base64Image: string) => {
      try {
        setError(null);
        const avatarUrl = await uploadAvatarSupabase(base64Image);
        if (user) {
          setUser({ ...user, avatar: avatarUrl });
        }
        return avatarUrl;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
        console.error('Upload avatar error:', errorMessage);
        setError(errorMessage);
        throw error;
      }
    },
    [user]
  );

  const refetch = useCallback((skipCache: boolean = true) => {
    return loadUser(skipCache);
  }, [loadUser]);

  const isClient = user?.role === "client";
  const isAgent =
    user?.role === "agent" || user?.role === "agency" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  return useMemo(
    () => ({
      user,
      isLoading,
      error,
      updateProfile,
      uploadAvatar,
      refetch,
      isClient,
      isAgent,
      isAdmin,
      isAuthenticated: !!user,
    }),
    [
      user,
      isLoading,
      error,
      updateProfile,
      uploadAvatar,
      refetch,
      isClient,
      isAgent,
      isAdmin,
    ]
  );
});
