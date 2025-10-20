import { useState, useEffect, useMemo, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { trpc } from "@/lib/trpc";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role: "client" | "agent" | "agency" | "admin";
  verified: boolean;
  blocked: boolean;
  createdAt: Date | null;
  lastActive: Date | null;
  accountTier: "free" | "pro" | "agency";
  hasAgentProfile: boolean;
}

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (meQuery.data) {
      setUser({
        id: meQuery.data.id,
        email: meQuery.data.email,
        name: meQuery.data.name,
        phone: meQuery.data.phone,
        avatar: meQuery.data.avatar,
        role: meQuery.data.role,
        verified: meQuery.data.verified,
        blocked: meQuery.data.blocked,
        createdAt: meQuery.data.createdAt,
        lastActive: meQuery.data.lastActive,
        accountTier: meQuery.data.accountTier,
        hasAgentProfile: meQuery.data.hasAgentProfile,
      });
    }
    setIsLoading(meQuery.isLoading);
  }, [meQuery.data, meQuery.isLoading]);

  const updateProfileMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      meQuery.refetch();
    },
  });

  const uploadAvatarMutation = trpc.users.uploadAvatar.useMutation({
    onSuccess: () => {
      meQuery.refetch();
    },
  });

  const updateProfile = useCallback(
    async (updates: { name?: string; phone?: string }) => {
      await updateProfileMutation.mutateAsync(updates);
    },
    [updateProfileMutation]
  );

  const uploadAvatar = useCallback(
    async (base64Image: string) => {
      const result = await uploadAvatarMutation.mutateAsync({ base64Image });
      return result.avatarUrl;
    },
    [uploadAvatarMutation]
  );

  const refetch = useCallback(() => {
    meQuery.refetch();
  }, [meQuery]);

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
