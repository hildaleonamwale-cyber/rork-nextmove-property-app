import { useMemo, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { AgentProfile as ImportedAgentProfile, AgentPackage, PropertyDraft, BookingSlot, AgentUpdate, StaffMember as ImportedStaffMember, ManagedProperty as ImportedManagedProperty } from '@/types/property';
import { useSupabaseAgent, useSupabaseManagedProperties, useSupabaseStaff, StaffMember as SupabaseStaff } from '@/hooks/useSupabaseAgent';
import { useSupabaseProperties } from '@/hooks/useSupabaseProperties';
import { useUser } from './UserContext';

export const [AgentProfileProvider, useAgentProfile] = createContextHook(() => {
  const { user, isLoading: userLoading } = useUser();
  const { agent, isLoading: agentLoading, createAgent, updateAgent, refetch: refetchAgent } = useSupabaseAgent(user?.id);
  const { properties: managedProperties, isLoading: managedLoading, createProperty: createManagedProperty, updateProperty: updateManagedProperty, deleteProperty: deleteManagedProperty } = useSupabaseManagedProperties(agent?.id);
  const { staff, isLoading: staffLoading, addStaff: addSupabaseStaff, updateStaff: updateSupabaseStaff, removeStaff: removeSupabaseStaff } = useSupabaseStaff(agent?.id);
  const { properties: agentProperties } = useSupabaseProperties({ });

  const isLoading = userLoading || agentLoading || managedLoading || staffLoading;

  const profile: ImportedAgentProfile = useMemo(() => {
    if (!agent || !user) {
      return {
        id: '',
        userId: '',
        package: 'free',
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
        profileCards: [],
      };
    }

    const totalViews = agentProperties.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalInquiries = agentProperties.reduce((sum, p) => sum + (p.inquiries || 0), 0);
    const totalBookings = agentProperties.reduce((sum, p) => sum + (p.bookings || 0), 0);

    return {
      id: agent.id,
      userId: agent.userId,
      name: agent.companyName || user.name,
      email: user.email,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      bio: agent.bio,
      specialization: agent.specialization,
      licenseNumber: agent.licenseNumber,
      yearsExperience: agent.yearsOfExperience,
      package: agent.packageLevel,
      packageExpiry: agent.packageExpiry,
      accountSetupComplete: !!agent.companyName,
      specialties: agent.specialization ? [agent.specialization] : [],
      languages: [],
      areasServed: agent.areasServed ? agent.areasServed.split(',').map(s => s.trim()) : [],
      website: agent.website,
      socialMedia: {
        facebook: agent.facebook,
        twitter: agent.twitter,
        instagram: agent.instagram,
        linkedin: agent.linkedin,
      },
      updates: [],
      staff: staff.map(transformStaffToLocal),
      bookingSlots: [],
      analytics: {
        views: { total: totalViews, thisMonth: totalViews, trend: 0 },
        inquiries: { total: totalInquiries, thisMonth: totalInquiries, trend: 0 },
        bookings: { total: totalBookings, thisMonth: totalBookings, trend: 0 },
        propertyViews: agentProperties.map(p => ({
          propertyId: p.id,
          propertyTitle: p.title,
          views: p.views || 0,
          inquiries: p.inquiries || 0,
          bookings: p.bookings || 0,
        })),
      },
      rating: agent.rating,
      reviewCount: agent.reviewCount,
      verified: user.verified,
      profileCards: [],
    };
  }, [agent, user, staff, agentProperties]);

  const updateProfile = useCallback(async (updates: Partial<ImportedAgentProfile>) => {
    if (!agent) {
      if (user?.role === 'client' || user?.role === 'admin') {
        await createAgent({
          companyName: updates.companyName,
          bio: updates.bio,
          specialization: updates.specialties?.[0],
          licenseNumber: undefined,
          yearsOfExperience: updates.yearsExperience,
          areasServed: undefined,
          website: updates.website,
          facebook: updates.socialMedia?.facebook,
          twitter: updates.socialMedia?.twitter,
          instagram: updates.socialMedia?.instagram,
          linkedin: updates.socialMedia?.linkedin,
        });
      } else {
        throw new Error('Cannot create agent profile');
      }
    } else {
      await updateAgent({
        companyName: updates.companyName,
        bio: updates.bio,
        specialization: updates.specialties?.[0],
        licenseNumber: undefined,
        yearsOfExperience: updates.yearsExperience,
        packageLevel: updates.package,
        packageExpiry: undefined,
        areasServed: undefined,
        website: updates.website,
        facebook: updates.socialMedia?.facebook,
        twitter: updates.socialMedia?.twitter,
        instagram: updates.socialMedia?.instagram,
        linkedin: updates.socialMedia?.linkedin,
      });
    }
  }, [agent, user, createAgent, updateAgent]);

  const upgradePackage = useCallback(async (newPackage: AgentPackage) => {
    if (!agent) throw new Error('No agent profile');
    await updateAgent({ packageLevel: newPackage });
  }, [agent, updateAgent]);

  const completeOnboarding = useCallback(async () => {
    await refetchAgent();
  }, [refetchAgent]);

  const propertyDrafts: PropertyDraft[] = useMemo(() => [], []);

  const addPropertyDraft = useCallback(async (draft: PropertyDraft) => {
    console.log('Property drafts are not stored separately - use property creation');
  }, []);

  const updatePropertyDraft = useCallback(async (id: string, updates: Partial<PropertyDraft>) => {
    console.log('Property drafts are not stored separately - use property update');
  }, []);

  const deletePropertyDraft = useCallback(async (id: string) => {
    console.log('Property drafts are not stored separately - use property deletion');
  }, []);

  const managedPropertiesLocal: ImportedManagedProperty[] = managedProperties.map(p => ({
    id: p.id,
    name: p.name,
    address: p.address,
    type: p.type,
    status: p.status,
    notes: p.notes,
    images: p.images || [],
    documents: [],
    tenant: p.tenantName ? {
      name: p.tenantName,
      phone: p.tenantPhone || '',
      email: p.tenantEmail || '',
      moveInDate: p.tenantMoveInDate || new Date(),
    } : undefined,
    isListed: p.isListed,
    listedPropertyId: p.listedPropertyId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  const addManagedProperty = useCallback(async (property: ImportedManagedProperty) => {
    await createManagedProperty({
      name: property.name,
      address: property.address,
      type: property.type,
      status: property.status,
      notes: property.notes,
      images: property.images,
      documents: [],
      tenantName: property.tenant?.name,
      tenantPhone: property.tenant?.phone,
      tenantEmail: property.tenant?.email,
      tenantMoveInDate: property.tenant?.moveInDate,
      isListed: property.isListed,
      listedPropertyId: property.listedPropertyId,
    });
  }, [createManagedProperty]);

  const updateManagedPropertyLocal = useCallback(async (id: string, updates: Partial<ImportedManagedProperty>) => {
    await updateManagedProperty(id, {
      name: updates.name,
      address: updates.address,
      type: updates.type,
      status: updates.status,
      notes: updates.notes,
      images: updates.images,
      documents: [],
      tenantName: updates.tenant?.name,
      tenantPhone: updates.tenant?.phone,
      tenantEmail: updates.tenant?.email,
      tenantMoveInDate: updates.tenant?.moveInDate,
      isListed: updates.isListed,
      listedPropertyId: updates.listedPropertyId,
    });
  }, [updateManagedProperty]);

  const deleteManagedPropertyLocal = useCallback(async (id: string) => {
    await deleteManagedProperty(id);
  }, [deleteManagedProperty]);

  const listManagedProperty = useCallback(async (id: string, listingData: PropertyDraft) => {
    await updateManagedProperty(id, { isListed: true, listedPropertyId: listingData.id });
  }, [updateManagedProperty]);

  const addBookingSlot = useCallback(async (slot: Omit<BookingSlot, 'id'>) => {
    console.log('Booking slots not yet implemented in Supabase');
  }, []);

  const updateBookingSlot = useCallback(async (id: string, updates: Partial<BookingSlot>) => {
    console.log('Booking slots not yet implemented in Supabase');
  }, []);

  const deleteBookingSlot = useCallback(async (id: string) => {
    console.log('Booking slots not yet implemented in Supabase');
  }, []);

  const addUpdate = useCallback(async (update: Omit<AgentUpdate, 'id' | 'timestamp'>) => {
    console.log('Agent updates not yet implemented in Supabase');
  }, []);

  const deleteUpdate = useCallback(async (id: string) => {
    console.log('Agent updates not yet implemented in Supabase');
  }, []);

  const addStaffMember = useCallback(async (member: ImportedStaffMember) => {
    await addSupabaseStaff({
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      permissions: member.permissions || [],
      active: member.active || false,
      inviteToken: member.inviteToken,
      inviteExpiry: member.inviteExpiry,
    });
  }, [addSupabaseStaff]);

  const updateStaffMember = useCallback(async (id: string, updates: Partial<ImportedStaffMember>) => {
    await updateSupabaseStaff(id, {
      name: updates.name,
      role: updates.role,
      email: updates.email,
      phone: updates.phone,
      permissions: updates.permissions,
      active: updates.active,
      inviteToken: updates.inviteToken,
      inviteExpiry: updates.inviteExpiry,
    });
  }, [updateSupabaseStaff]);

  const removeStaffMember = useCallback(async (id: string) => {
    await removeSupabaseStaff(id);
  }, [removeSupabaseStaff]);

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
    managedProperties: managedPropertiesLocal,
    isLoading,
    updateProfile,
    upgradePackage,
    completeOnboarding,
    addPropertyDraft,
    updatePropertyDraft,
    deletePropertyDraft,
    addManagedProperty,
    updateManagedProperty: updateManagedPropertyLocal,
    deleteManagedProperty: deleteManagedPropertyLocal,
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
    managedPropertiesLocal,
    isLoading,
    updateProfile,
    upgradePackage,
    completeOnboarding,
    addPropertyDraft,
    updatePropertyDraft,
    deletePropertyDraft,
    addManagedProperty,
    updateManagedPropertyLocal,
    deleteManagedPropertyLocal,
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

function transformStaffToLocal(staff: SupabaseStaff): ImportedStaffMember {
  return {
    id: staff.id,
    name: staff.name,
    role: staff.role,
    email: staff.email,
    phone: staff.phone,
    permissions: staff.permissions,
    active: staff.active,
    inviteToken: staff.inviteToken,
    inviteExpiry: staff.inviteExpiry,
  };
}
