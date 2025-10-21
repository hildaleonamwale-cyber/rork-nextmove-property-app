import { supabase } from '@/lib/supabase';

export function getSupabaseStorageUrl(bucketName: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

export function getPropertyImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return getSupabaseStorageUrl('properties', imagePath);
}

export function getAvatarUrl(avatarPath: string | null | undefined): string {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http')) return avatarPath;
  return getSupabaseStorageUrl('avatars', avatarPath);
}

export function getBannerUrl(bannerPath: string | null | undefined): string {
  if (!bannerPath) return '';
  if (bannerPath.startsWith('http')) return bannerPath;
  return getSupabaseStorageUrl('banners', bannerPath);
}
