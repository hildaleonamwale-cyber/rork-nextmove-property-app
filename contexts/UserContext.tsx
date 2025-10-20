import { useState, useEffect, useMemo, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { getCurrentUser, updateProfile as updateProfileSupabase, uploadAvatar as uploadAvatarSupabase, SupabaseUser } from "@/utils/supabase-auth";

export type User = SupabaseUser;

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = useCallback(
    async (updates: { name?: string; phone?: string }) => {
      const updatedUser = await updateProfileSupabase(updates);
      setUser(updatedUser);
    },
    []
  );

  const uploadAvatar = useCallback(
    async (base64Image: string) => {
      const avatarUrl = await uploadAvatarSupabase(base64Image);
      if (user) {
        setUser({ ...user, avatar: avatarUrl });
      }
      return avatarUrl;
    },
    [user]
  );

  const refetch = useCallback(() => {
    loadUser();
  }, []);

  const isClient = user?.role === "client";
  const isAgent =
    user?.role === "agent" || user?.role === "agency" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  return useMemo(
    () => ({
      user,
      isLoading,
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
      updateProfile,
      uploadAvatar,
      refetch,
      isClient,
      isAgent,
      isAdmin,
    ]
  );
});
