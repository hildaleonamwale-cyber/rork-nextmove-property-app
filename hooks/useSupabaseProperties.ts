import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/property';

interface PropertyFilters {
  city?: string;
  propertyType?: string;
  listingCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export function useSupabaseProperties(filters?: PropertyFilters) {
  const [properties, setProperties] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (filters !== undefined) {
      fetchProperties();
    } else {
      setIsLoading(false);
    }

    const subscription = supabase
      .channel('properties_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        console.log('Properties changed, refetching...');
        if (filters !== undefined) {
          fetchProperties();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('properties')
        .select(`
          id, title, description, property_type, listing_category, status,
          price, price_type, images, area, area_unit, furnished, parking,
          amenities, address, city, state, country, zip_code, latitude, longitude,
          featured, views, inquiries, agent_id, user_id, created_at
        `, { count: 'exact' });

      if (filters?.city) {
        query = query.eq('city', filters.city);
      }

      if (filters?.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }

      if (filters?.listingCategory) {
        query = query.eq('listing_category', filters.listingCategory);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Beds filter removed - property structure varies by type

      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      query = query.order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        console.error('Properties fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      setTotalCount(count || 0);
      setProperties(data?.map(transformProperty) || []);
    } catch (err: any) {
      console.error('Failed to fetch properties:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchProperties();
  };

  return { properties, isLoading, error, totalCount, refetch };
}

export function useSupabaseProperty(id: string) {
  const [property, setProperty] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }

    const subscription = supabase
      .channel(`property_${id}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties', filter: `id=eq.${id}` }, () => {
        console.log('Property changed, refetching...');
        fetchProperty();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProperty = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('properties')
        .select(`
          id, title, description, property_type, listing_category, status,
          price, price_type, images, area, area_unit, furnished, parking,
          amenities, address, city, state, country, zip_code, latitude, longitude,
          featured, views, inquiries, agent_id, user_id, created_at
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Property fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      await supabase
        .from('properties')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', id);

      setProperty(transformProperty(data));
    } catch (err: any) {
      console.error('Failed to fetch property:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchProperty();
  };

  return { property, isLoading, error, refetch };
}

function transformProperty(data: any): Listing {
  const images = typeof data.images === 'string' ? JSON.parse(data.images) : (data.images || []);
  const amenities = typeof data.amenities === 'string' ? JSON.parse(data.amenities) : (data.amenities || []);
  
  const coordinates = data.latitude && data.longitude 
    ? { latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) }
    : { latitude: 0, longitude: 0 };

  const base = {
    id: data.id,
    title: data.title,
    description: data.description,
    price: data.price,
    priceType: data.price_type as 'monthly' | 'total',
    location: {
      address: data.address || '',
      area: data.state || '',
      city: data.city || '',
      province: data.state || '',
      country: data.country || 'Zimbabwe',
      coordinates: coordinates,
    },
    images: images,
    area: data.area || 0,
    status: data.status as 'For Rent' | 'For Sale' | 'Internal Management',
    verified: false,
    featured: data.featured || false,
    agentId: data.agent_id,
    views: data.views || 0,
    bookings: 0,
    inquiries: data.inquiries || 0,
    listingCategory: data.listing_category as any,
    createdAt: data.created_at ? new Date(data.created_at) : undefined,
  };

  if (data.listing_category === 'stand') {
    return {
      ...base,
      priceType: 'total' as const,
      status: 'For Sale' as const,
      landFeatures: amenities,
      titleDeeds: false,
      serviced: false,
    } as any;
  }

  if (data.listing_category === 'commercial') {
    return {
      ...base,
      floors: 1,
      parkingSpaces: data.parking ? 1 : 0,
      commercialType: data.property_type as any,
      features: amenities,
      furnished: data.furnished || false,
    } as any;
  }

  return {
    ...base,
    bedrooms: 0,
    bathrooms: 0,
    propertyType: data.property_type as any,
    amenities: amenities,
  } as any;
}
