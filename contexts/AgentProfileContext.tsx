import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { AgentProfile, AgentPackage, PropertyDraft, BookingSlot, AgentUpdate, StaffMember, ManagedProperty } from '@/types/property';

const AGENT_PROFILE_KEY = '@agent_profile';
const PROPERTY_DRAFTS_KEY = '@property_drafts';
const MANAGED_PROPERTIES_KEY = '@managed_properties';

const getInitialProfile = (): AgentProfile => ({
  id: 'agent-1',
  userId: 'user-1',
  package: 'agency',
  accountSetupComplete: false,
  specialties: [],
  languages: [],
  updates: [],
  staff: [],
  bookingSlots: [],
  analytics: {
    views: { total: 0, thisMonth: 0, trend: 0 },
    inquiries: { total: 0, thisMonth: 0, trend: 0 },
    bookings: { total: 0, thisMonth: 0, trend: 0 },
    propertyViews: [],
  },
  verified: false,
  profileCards: [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      title: 'Luxury Waterfront Estate',
      description: 'Experience unparalleled elegance in this stunning 5-bedroom waterfront property',
      ctaText: 'View Property',
      order: 0,
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      title: 'Modern City Apartment',
      description: 'Contemporary living in the heart of downtown with breathtaking city views',
      ctaText: 'Learn More',
      order: 1,
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      title: 'Family Dream Home',
      description: 'Spacious 4-bedroom home perfect for growing families',
      ctaText: 'Schedule Tour',
      order: 2,
    },
  ],
});

export const [AgentProfileProvider, useAgentProfile] = createContextHook(() => {
  const [profile, setProfile] = useState<AgentProfile>(getInitialProfile());
  const [propertyDrafts, setPropertyDrafts] = useState<PropertyDraft[]>([]);
  const [managedProperties, setManagedProperties] = useState<ManagedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedProfile, storedDrafts, storedManaged] = await Promise.all([
        AsyncStorage.getItem(AGENT_PROFILE_KEY),
        AsyncStorage.getItem(PROPERTY_DRAFTS_KEY),
        AsyncStorage.getItem(MANAGED_PROPERTIES_KEY),
      ]);

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }

      if (storedDrafts) {
        setPropertyDrafts(JSON.parse(storedDrafts));
      }

      if (storedManaged) {
        setManagedProperties(JSON.parse(storedManaged));
      }
    } catch (error) {
      console.error('Failed to load agent data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = useCallback(async (updatedProfile: AgentProfile) => {
    try {
      await AsyncStorage.setItem(AGENT_PROFILE_KEY, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<AgentProfile>) => {
    const updatedProfile = { ...profile, ...updates };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const upgradePackage = useCallback(async (newPackage: AgentPackage) => {
    const updatedProfile = { ...profile, package: newPackage };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const completeOnboarding = useCallback(async () => {
    const updatedProfile = { ...profile, accountSetupComplete: true };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const addPropertyDraft = useCallback(async (draft: PropertyDraft) => {
    const updated = [...propertyDrafts, draft];
    try {
      await AsyncStorage.setItem(PROPERTY_DRAFTS_KEY, JSON.stringify(updated));
      setPropertyDrafts(updated);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [propertyDrafts]);

  const updatePropertyDraft = useCallback(async (id: string, updates: Partial<PropertyDraft>) => {
    const updated = propertyDrafts.map(d => d.id === id ? { ...d, ...updates } : d);
    try {
      await AsyncStorage.setItem(PROPERTY_DRAFTS_KEY, JSON.stringify(updated));
      setPropertyDrafts(updated);
    } catch (error) {
      console.error('Failed to update draft:', error);
    }
  }, [propertyDrafts]);

  const deletePropertyDraft = useCallback(async (id: string) => {
    const updated = propertyDrafts.filter(d => d.id !== id);
    try {
      await AsyncStorage.setItem(PROPERTY_DRAFTS_KEY, JSON.stringify(updated));
      setPropertyDrafts(updated);
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  }, [propertyDrafts]);

  const addBookingSlot = useCallback(async (slot: Omit<BookingSlot, 'id'>) => {
    const newSlot: BookingSlot = { ...slot, id: Date.now().toString() };
    const updatedProfile = {
      ...profile,
      bookingSlots: [...profile.bookingSlots, newSlot],
    };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const updateBookingSlot = useCallback(async (id: string, updates: Partial<BookingSlot>) => {
    const updatedProfile = {
      ...profile,
      bookingSlots: profile.bookingSlots.map(slot => 
        slot.id === id ? { ...slot, ...updates } : slot
      ),
    };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const deleteBookingSlot = useCallback(async (id: string) => {
    const updatedProfile = {
      ...profile,
      bookingSlots: profile.bookingSlots.filter(slot => slot.id !== id),
    };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const addUpdate = useCallback(async (update: Omit<AgentUpdate, 'id' | 'timestamp'>) => {
    const newUpdate: AgentUpdate = {
      ...update,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    const updatedProfile = {
      ...profile,
      updates: [newUpdate, ...profile.updates],
    };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const deleteUpdate = useCallback(async (id: string) => {
    const updatedProfile = {
      ...profile,
      updates: profile.updates.filter(u => u.id !== id),
    };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const addStaffMember = useCallback(async (member: StaffMember) => {
    const updatedProfile = {
      ...profile,
      staff: [...profile.staff, member],
    };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const updateStaffMember = useCallback(async (id: string, updates: Partial<StaffMember>) => {
    const updatedProfile = {
      ...profile,
      staff: profile.staff.map(member => 
        member.id === id ? { ...member, ...updates } : member
      ),
    };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const removeStaffMember = useCallback(async (id: string) => {
    const updatedProfile = {
      ...profile,
      staff: profile.staff.filter(member => member.id !== id),
    };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const addManagedProperty = useCallback(async (property: ManagedProperty) => {
    const updated = [...managedProperties, property];
    try {
      await AsyncStorage.setItem(MANAGED_PROPERTIES_KEY, JSON.stringify(updated));
      setManagedProperties(updated);
    } catch (error) {
      console.error('Failed to add managed property:', error);
    }
  }, [managedProperties]);

  const updateManagedProperty = useCallback(async (id: string, updates: Partial<ManagedProperty>) => {
    const updated = managedProperties.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p);
    try {
      await AsyncStorage.setItem(MANAGED_PROPERTIES_KEY, JSON.stringify(updated));
      setManagedProperties(updated);
    } catch (error) {
      console.error('Failed to update managed property:', error);
    }
  }, [managedProperties]);

  const deleteManagedProperty = useCallback(async (id: string) => {
    const updated = managedProperties.filter(p => p.id !== id);
    try {
      await AsyncStorage.setItem(MANAGED_PROPERTIES_KEY, JSON.stringify(updated));
      setManagedProperties(updated);
    } catch (error) {
      console.error('Failed to delete managed property:', error);
    }
  }, [managedProperties]);

  const listManagedProperty = useCallback(async (id: string, listingData: PropertyDraft) => {
    await addPropertyDraft(listingData);
    await updateManagedProperty(id, { isListed: true, listedPropertyId: listingData.id });
  }, [addPropertyDraft, updateManagedProperty]);

  const hasFeature = useCallback((feature: string): boolean => {
    const packageFeatures = {
      free: ['basic_listing', 'profile_edit', 'banner_upload', 'updates', 'basic_analytics'],
      pro: ['basic_listing', 'profile_edit', 'banner_upload', 'updates', 'basic_analytics', 
            'booking_calendar', 'messaging', 'verified_badge', 'full_analytics'],
      agency: ['basic_listing', 'profile_edit', 'banner_upload', 'updates', 'basic_analytics',
               'booking_calendar', 'messaging', 'verified_badge', 'full_analytics',
               'staff_accounts', 'shared_dashboard', 'portfolio_page', '3d_tours', 'property_management'],
    };

    return packageFeatures[profile.package].includes(feature);
  }, [profile.package]);

  return useMemo(() => ({
    profile,
    propertyDrafts,
    managedProperties,
    isLoading,
    updateProfile,
    upgradePackage,
    completeOnboarding,
    addPropertyDraft,
    updatePropertyDraft,
    deletePropertyDraft,
    addManagedProperty,
    updateManagedProperty,
    deleteManagedProperty,
    listManagedProperty,
    addBookingSlot,
    updateBookingSlot,
    deleteBookingSlot,
    addUpdate,
    deleteUpdate,
    addStaffMember,
    updateStaffMember,
    removeStaffMember,
    hasFeature,
  }), [
    profile,
    propertyDrafts,
    managedProperties,
    isLoading,
    updateProfile,
    upgradePackage,
    completeOnboarding,
    addPropertyDraft,
    updatePropertyDraft,
    deletePropertyDraft,
    addManagedProperty,
    updateManagedProperty,
    deleteManagedProperty,
    listManagedProperty,
    addBookingSlot,
    updateBookingSlot,
    deleteBookingSlot,
    addUpdate,
    deleteUpdate,
    addStaffMember,
    updateStaffMember,
    removeStaffMember,
    hasFeature,
  ]);
});
