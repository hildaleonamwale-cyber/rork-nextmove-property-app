import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/property';

export function useSupabaseWishlist(userId: string) {
  const [wishlist, setWishlist] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchWishlist();

      const channel = supabase
        .channel('wishlist-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'wishlists',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchWishlist();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('wishlists')
        .select(`
          property_id,
          properties(
            id, title, description, property_type, listing_category, status,
            price, price_type, images, bedrooms, bathrooms, 
            area, address, city, state, country, 
            latitude, longitude, featured, views,
            inquiries, amenities, agent_id, user_id, created_at
          )
        `)
        .eq('user_id', userId);

      if (fetchError) {
        console.error('Wishlist fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      const transformed = data
        ?.map((item: any) => transformProperty(item.properties))
        .filter((p): p is Listing => p !== null) || [];
      setWishlist(transformed);
    } catch (err: any) {
      console.error('Failed to fetch wishlist:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (propertyId: string) => {
    const { error } = await supabase.from('wishlists').insert({
      user_id: userId,
      property_id: propertyId,
    });

    if (error) {
      console.error('Add to wishlist error:', error);
      throw new Error(error.message);
    }
  };

  const removeFromWishlist = async (propertyId: string) => {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) {
      console.error('Remove from wishlist error:', error);
      throw new Error(error.message);
    }
  };

  const isInWishlist = (propertyId: string) => {
    return wishlist.some((item) => item.id === propertyId);
  };

  return {
    wishlist,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlist,
  };
}

function transformProperty(data: any): Listing | null {
  if (!data) return null;

  const coordinates = data.coordinates || 
    (data.latitude && data.longitude ? 
      { latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) } : 
      { latitude: 0, longitude: 0 }
    );

  const base = {
    id: data.id,
    title: data.title,
    description: data.description,
    price: data.price,
    priceType: data.price_type as 'monthly' | 'sale',
    location: {
      address: data.address || '',
      area: data.suburb || data.city || '',
      city: data.city || '',
      province: data.province || data.state || '',
      country: data.country || 'Zimbabwe',
      coordinates: coordinates,
    },
    images: data.images || [],
    area: data.area || 0,
    status: data.status as 'For Rent' | 'For Sale' | 'Internal Management',
    verified: data.verified || false,
    featured: data.featured || false,
    agentId: data.agent_id,
    views: data.views || 0,
    bookings: data.bookings || 0,
    inquiries: data.inquiries || 0,
    listingCategory: data.listing_category as any,
    createdAt: data.created_at ? (() => {
      const parsed = new Date(data.created_at);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    })() : undefined,
  };

  if (data.listing_category === 'stand') {
    return {
      ...base,
      priceType: 'sale' as const,
      status: 'For Sale' as const,
      landFeatures: data.amenities || [],
      titleDeeds: data.title_deeds || false,
      serviced: data.serviced || false,
      developerSession: data.developer_session,
    } as any;
  }

  if (data.listing_category === 'commercial') {
    return {
      ...base,
      floors: data.floors || 1,
      parkingSpaces: data.parking_spaces || 0,
      commercialType: data.property_type as any,
      features: data.amenities || [],
      furnished: data.furnished,
      yearBuilt: data.year_built,
      zoning: data.zoning,
    } as any;
  }

  return {
    ...base,
    bedrooms: data.bedrooms || 0,
    bathrooms: data.bathrooms || 0,
    propertyType: data.property_type as any,
    amenities: data.amenities || [],
  } as any;
}
