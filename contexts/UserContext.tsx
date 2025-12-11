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
      console.log('[UserContext] ===== LOADING USER =====');
      console.log('[UserContext] skipCache:', skipCache);
      console.log('[UserContext] Timestamp:', new Date().toISOString());
      
      console.log('[UserContext] Setting isLoading to true');
      setIsLoading(true);
      setError(null);
      
      console.log('[UserContext] Calling getCurrentUser...');
      const startGetUser = Date.now();
      const currentUser = await getCurrentUser(skipCache);
      const getUserDuration = Date.now() - startGetUser;
      
      console.log('[UserContext] ✓ getCurrentUser completed in', getUserDuration, 'ms');
      console.log('[UserContext] User loaded:', currentUser ? JSON.stringify({ id: currentUser.id, email: currentUser.email, role: currentUser.role }) : 'No user');
      
      console.log('[UserContext] Setting user state...');
      setUser(currentUser);
      console.log('[UserContext] ✓ User state set');
      console.log('[UserContext] ===== LOAD USER COMPLETE =====');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserContext] ❌ Error loading user:', errorMessage);
      console.error('[UserContext] Error:', error);
      setError(errorMessage);
      setUser(null);
    } finally {
      console.log('[UserContext] Setting isLoading to false');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[UserContext] Mounting - initial user load');
    loadUser();

    console.log('[UserContext] Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[UserContext] 🔔 Auth state changed:', event, session ? 'Session exists' : 'No session');
      console.log('[UserContext] Session user ID:', session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('[UserContext] Session active/refreshed, loading user...');
        const startLoad = Date.now();
        await loadUser(true);
        console.log('[UserContext] Reload after', event, 'took', Date.now() - startLoad, 'ms');
      } else if (event === 'SIGNED_OUT') {
        console.log('[UserContext] User signed out');
        setUser(null);
        setError(null);
      }
    });

    console.log('[UserContext] Auth listener set up');

    return () => {
      console.log('[UserContext] Unmounting - cleaning up');
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
    console.log('[UserContext] refetch called with skipCache:', skipCache);
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
