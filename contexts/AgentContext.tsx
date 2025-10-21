import { useMemo, useCallback, useState, useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { supabase } from "@/lib/supabase";
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
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('agent_profiles')
        .select('*, users(name, avatar)')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          userId: data.user_id,
          package: data.package,
          accountSetupComplete: !!data.account_setup_complete,
          companyName: data.company_name,
          companyLogo: data.company_logo,
          banner: data.banner,
          bio: data.bio,
          specialties: data.specialties || [],
          yearsExperience: data.years_experience,
          languages: data.languages || [],
          phone: data.phone,
          email: data.email,
          website: data.website,
          address: data.address,
          socialMedia: data.social_media || {},
          followers: data.followers || 0,
          following: data.following || 0,
          verified: !!data.verified,
          userName: data.users?.name || '',
          userAvatar: data.users?.avatar,
        });
      }
    } catch (error) {
      console.error('Failed to fetch agent profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && isAgent) {
      console.log('Fetching agent profile for user:', user.id, 'hasAgentProfile:', user.hasAgentProfile);
      fetchProfile();
    } else {
      console.log('Not fetching agent profile - user:', user?.id, 'isAgent:', isAgent);
      setProfile(null);
    }
  }, [user?.id, isAgent, fetchProfile]);

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
      if (!user?.id) throw new Error('No user ID');

      const { data: newProfile, error } = await supabase
        .from('agent_profiles')
        .insert({
          user_id: user.id,
          package: data.package || 'free',
          company_name: data.companyName,
          bio: data.bio,
          specialties: data.specialties,
          years_experience: data.yearsExperience,
          languages: data.languages,
          phone: data.phone,
          email: data.email,
          website: data.website,
          address: data.address,
          account_setup_complete: false,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('users')
        .update({ has_agent_profile: true })
        .eq('id', user.id);

      await fetchProfile();
      return newProfile.id;
    },
    [user?.id, fetchProfile]
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
      if (!user?.id) throw new Error('No user ID');

      const { error } = await supabase
        .from('agent_profiles')
        .update({
          package: updates.package,
          account_setup_complete: updates.accountSetupComplete,
          company_name: updates.companyName,
          company_logo: updates.companyLogo,
          banner: updates.banner,
          bio: updates.bio,
          specialties: updates.specialties,
          years_experience: updates.yearsExperience,
          languages: updates.languages,
          phone: updates.phone,
          email: updates.email,
          website: updates.website,
          address: updates.address,
          social_media: updates.socialMedia,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProfile();
    },
    [user?.id, fetchProfile]
  );

  const upgradePackage = useCallback(
    async (newPackage: "free" | "pro" | "agency") => {
      if (!user?.id) throw new Error('No user ID');

      const { error } = await supabase
        .from('agent_profiles')
        .update({ package: newPackage })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProfile();
    },
    [user?.id, fetchProfile]
  );

  const completeOnboarding = useCallback(async () => {
    if (!user?.id) throw new Error('No user ID');

    await updateProfile({ accountSetupComplete: true });

    await supabase
      .from('users')
      .update({ has_agent_profile: true })
      .eq('id', user.id);
  }, [updateProfile, user?.id]);

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
    fetchProfile();
  }, [fetchProfile]);

  return useMemo(
    () => ({
      profile,
      isLoading,
      createProfile,
      updateProfile,
      upgradePackage,
      completeOnboarding,
      hasFeature,
      refetch,
    }),
    [
      profile,
      isLoading,
      createProfile,
      updateProfile,
      upgradePackage,
      completeOnboarding,
      hasFeature,
      refetch,
    ]
  );
});
