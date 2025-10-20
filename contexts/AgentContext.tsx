import { useMemo, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { trpc } from "@/lib/trpc";
import { useUser } from "./UserContext";

export interface AgentProfile {
  id: string;
  userId: string;
  package: "free" | "pro" | "agency";
  accountSetupComplete: boolean;
  companyName?: string | null;
  companyLogo?: string | null;
  banner?: string | null;
  bio?: string | null;
  specialties: string[];
  yearsExperience?: number | null;
  languages: string[];
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  socialMedia: Record<string, string>;
  followers: number;
  following: number;
  verified: boolean;
  userName: string;
  userAvatar?: string | null;
}

export const [AgentProvider, useAgent] = createContextHook(() => {
  const { user, isAgent } = useUser();

  const agentProfileQuery = trpc.agents.getProfile.useQuery(
    { userId: user?.id || "" },
    {
      enabled: !!user?.id && isAgent && user.hasAgentProfile,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const createProfileMutation = trpc.agents.createProfile.useMutation({
    onSuccess: () => {
      agentProfileQuery.refetch();
    },
  });

  const updateProfileMutation = trpc.agents.updateProfile.useMutation({
    onSuccess: () => {
      agentProfileQuery.refetch();
    },
  });

  const upgradePackageMutation = trpc.agents.upgradePackage.useMutation({
    onSuccess: () => {
      agentProfileQuery.refetch();
    },
  });

  const profile = useMemo<AgentProfile | null>(() => {
    if (!agentProfileQuery.data) return null;

    return {
      id: agentProfileQuery.data.id,
      userId: agentProfileQuery.data.userId,
      package: agentProfileQuery.data.package,
      accountSetupComplete: !!agentProfileQuery.data.accountSetupComplete,
      companyName: agentProfileQuery.data.companyName,
      companyLogo: agentProfileQuery.data.companyLogo,
      banner: agentProfileQuery.data.banner,
      bio: agentProfileQuery.data.bio,
      specialties: agentProfileQuery.data.specialties,
      yearsExperience: agentProfileQuery.data.yearsExperience,
      languages: agentProfileQuery.data.languages,
      phone: agentProfileQuery.data.phone,
      email: agentProfileQuery.data.email,
      website: agentProfileQuery.data.website,
      address: agentProfileQuery.data.address,
      socialMedia: agentProfileQuery.data.socialMedia,
      followers: agentProfileQuery.data.followers,
      following: agentProfileQuery.data.following,
      verified: !!agentProfileQuery.data.verified,
      userName: agentProfileQuery.data.userName,
      userAvatar: agentProfileQuery.data.userAvatar,
    };
  }, [agentProfileQuery.data]);

  const createProfile = useCallback(
    async (data: {
      package?: "free" | "pro" | "agency";
      companyName?: string;
      bio?: string;
      specialties?: string[];
      yearsExperience?: number;
      languages?: string[];
      phone?: string;
      email?: string;
      website?: string;
      address?: string;
    }) => {
      const result = await createProfileMutation.mutateAsync(data);
      return result.profileId;
    },
    [createProfileMutation]
  );

  const updateProfile = useCallback(
    async (updates: {
      package?: "free" | "pro" | "agency";
      accountSetupComplete?: boolean;
      companyName?: string;
      companyLogo?: string;
      banner?: string;
      bio?: string;
      specialties?: string[];
      yearsExperience?: number;
      languages?: string[];
      phone?: string;
      email?: string;
      website?: string;
      address?: string;
      socialMedia?: Record<string, string>;
    }) => {
      await updateProfileMutation.mutateAsync(updates);
    },
    [updateProfileMutation]
  );

  const upgradePackage = useCallback(
    async (newPackage: "free" | "pro" | "agency") => {
      await upgradePackageMutation.mutateAsync({ package: newPackage });
    },
    [upgradePackageMutation]
  );

  const completeOnboarding = useCallback(async () => {
    await updateProfile({ accountSetupComplete: true });
  }, [updateProfile]);

  const hasFeature = useCallback(
    (feature: string): boolean => {
      if (!profile) return false;

      const packageFeatures = {
        free: [
          "basic_listing",
          "profile_edit",
          "banner_upload",
          "updates",
          "basic_analytics",
        ],
        pro: [
          "basic_listing",
          "profile_edit",
          "banner_upload",
          "updates",
          "basic_analytics",
          "booking_calendar",
          "messaging",
          "verified_badge",
          "full_analytics",
        ],
        agency: [
          "basic_listing",
          "profile_edit",
          "banner_upload",
          "updates",
          "basic_analytics",
          "booking_calendar",
          "messaging",
          "verified_badge",
          "full_analytics",
          "staff_accounts",
          "shared_dashboard",
          "portfolio_page",
          "3d_tours",
          "property_management",
        ],
      };

      return packageFeatures[profile.package].includes(feature);
    },
    [profile]
  );

  const refetch = useCallback(() => {
    agentProfileQuery.refetch();
  }, [agentProfileQuery]);

  return useMemo(
    () => ({
      profile,
      isLoading: agentProfileQuery.isLoading,
      createProfile,
      updateProfile,
      upgradePackage,
      completeOnboarding,
      hasFeature,
      refetch,
    }),
    [
      profile,
      agentProfileQuery.isLoading,
      createProfile,
      updateProfile,
      upgradePackage,
      completeOnboarding,
      hasFeature,
      refetch,
    ]
  );
});
