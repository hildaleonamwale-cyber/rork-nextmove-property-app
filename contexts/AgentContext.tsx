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
  const { user, isAgent, refetch: refetchUser } = useUser();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('agents')
        .select('*, users!agents_user_id_fkey(name, avatar)')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          console.log('No agent profile found for user:', user.id);
          setProfile(null);
          return;
        }
        throw fetchError;
      }

      if (data) {
        const userData = Array.isArray(data.users) ? data.users[0] : data.users;
        const setupComplete = Boolean(data.company_name && data.company_name.trim().length > 0);
        setProfile({
          id: data.id,
          userId: data.user_id,
          package: data.package_level || 'free',
          accountSetupComplete: setupComplete,
          companyName: data.company_name,
          companyLogo: null,
          banner: null,
          bio: data.bio,
          specialties: data.specialization ? data.specialization.split(',').map((s: string) => s.trim()) : [],
          yearsExperience: data.years_of_experience,
          languages: [],
          phone: userData?.phone || null,
          email: userData?.email || null,
          website: data.website,
          address: data.areas_served,
          socialMedia: {
            facebook: data.facebook || '',
            twitter: data.twitter || '',
            instagram: data.instagram || '',
            linkedin: data.linkedin || '',
          },
          followers: 0,
          following: 0,
          verified: false,
          userName: userData?.name || '',
          userAvatar: userData?.avatar,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch agent profile';
      console.error('Failed to fetch agent profile:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && isAgent) {
      console.log('Fetching agent profile for user:', user.id, 'isAgent:', isAgent);
      fetchProfile();

      const subscription = supabase
        .channel(`agent_profile_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'agents',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            console.log('Agent profile changed, refetching...');
            fetchProfile();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
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
      if (!user?.id) throw new Error('No user ID - please log in first');

      try {
        console.log('Creating agent profile with data:', { userId: user.id, ...data });

        const { data: existingAgent } = await supabase
          .from('agents')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (existingAgent) {
          console.log('Agent profile already exists:', existingAgent.id);
          await fetchProfile();
          return existingAgent.id;
        }

        const { data: newProfile, error } = await supabase
          .from('agents')
          .insert({
            user_id: user.id,
            package_level: data.package || 'free',
            company_name: data.companyName,
            bio: data.bio,
            specialization: data.specialties?.join(', '),
            years_of_experience: data.yearsExperience,
            areas_served: data.address,
            website: data.website,
            rating: 0,
            review_count: 0,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating agent profile:', error);
          throw new Error(`Cannot create agent profile: ${error.message}`);
        }

        console.log('Agent profile created successfully:', newProfile);

        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'agent' })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating user role:', updateError);
        }

        await refetchUser();
        await fetchProfile();
        return newProfile.id;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create agent profile';
        console.error('Create profile error:', errorMessage);
        setError(errorMessage);
        throw error;
      }
    },
    [user?.id, fetchProfile, refetchUser]
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
      if (!user?.id) throw new Error('No user ID - please log in first');

      try {
        console.log('Updating agent profile with:', updates);

        const updateData: Record<string, unknown> = {};
        if (updates.package) updateData.package_level = updates.package;
        if (updates.companyName !== undefined) updateData.company_name = updates.companyName;
        if (updates.bio !== undefined) updateData.bio = updates.bio;
        if (updates.specialties !== undefined) updateData.specialization = updates.specialties.join(', ');
        if (updates.yearsExperience !== undefined) updateData.years_of_experience = updates.yearsExperience;
        if (updates.website !== undefined) updateData.website = updates.website;
        if (updates.address !== undefined) updateData.areas_served = updates.address;
        if (updates.socialMedia) {
          if (updates.socialMedia.facebook !== undefined) updateData.facebook = updates.socialMedia.facebook;
          if (updates.socialMedia.twitter !== undefined) updateData.twitter = updates.socialMedia.twitter;
          if (updates.socialMedia.instagram !== undefined) updateData.instagram = updates.socialMedia.instagram;
          if (updates.socialMedia.linkedin !== undefined) updateData.linkedin = updates.socialMedia.linkedin;
        }

        const { error } = await supabase
          .from('agents')
          .update(updateData)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating agent profile:', error);
          throw error;
        }

        await fetchProfile();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update agent profile';
        console.error('Update profile error:', errorMessage);
        setError(errorMessage);
        throw error;
      }
    },
    [user?.id, fetchProfile]
  );

  const upgradePackage = useCallback(
    async (newPackage: "free" | "pro" | "agency") => {
      if (!user?.id) throw new Error('No user ID - please log in first');

      try {
        const { error } = await supabase
          .from('agents')
          .update({ package_level: newPackage })
          .eq('user_id', user.id);

        if (error) throw error;

        await fetchProfile();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upgrade package';
        console.error('Upgrade package error:', errorMessage);
        setError(errorMessage);
        throw error;
      }
    },
    [user?.id, fetchProfile]
  );

  const completeOnboarding = useCallback(async () => {
    if (!user?.id) throw new Error('No user ID - please log in first');

    try {
      console.log('Completing onboarding for user:', user.id);

      const { data: existingAgent, error: fetchError } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking for existing agent:', fetchError);
        throw fetchError;
      }

      if (!existingAgent) {
        console.log('No agent profile exists, creating one...');
        await createProfile({});
      }

      const { error: roleError } = await supabase
        .from('users')
        .update({ role: 'agent' })
        .eq('id', user.id);

      if (roleError) {
        console.error('Error updating user role:', roleError);
        throw roleError;
      }

      await refetchUser();
      await fetchProfile();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding';
      console.error('Complete onboarding error:', errorMessage);
      setError(errorMessage);
      throw error;
    }
  }, [user?.id, fetchProfile, createProfile, refetchUser]);

  const hasFeature = useCallback(
    (feature: string): boolean => {
      if (!profile) return false;

      const packageFeatures: Record<string, string[]> = {
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
    return fetchProfile();
  }, [fetchProfile]);

  return useMemo(
    () => ({
      profile,
      isLoading,
      error,
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
      error,
      createProfile,
      updateProfile,
      upgradePackage,
      completeOnboarding,
      hasFeature,
      refetch,
    ]
  );
});
