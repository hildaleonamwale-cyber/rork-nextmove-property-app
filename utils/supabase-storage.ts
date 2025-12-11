import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

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

export async function uploadPropertyImages(
  images: string[],
  propertyId: string
): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const imageUri = images[i];
    
    try {
      let fileData: Blob | File;
      const fileName = `${propertyId}_${Date.now()}_${i}.jpg`;
      const filePath = `properties/${fileName}`;

      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        fileData = await response.blob();
      } else {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        fileData = blob;
      }

      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(filePath, fileData, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error(`Failed to upload image ${i}:`, uploadError);
        throw uploadError;
      }

      const publicUrl = getSupabaseStorageUrl('properties', filePath);
      uploadedUrls.push(publicUrl);
    } catch (error) {
      console.error(`Error uploading image ${i}:`, error);
      throw error;
    }
  }

  return uploadedUrls;
}

export async function uploadAvatarImage(
  imageUri: string,
  userId: string
): Promise<string> {
  try {
    let fileData: Blob | File;
    const fileName = `${userId}_${Date.now()}.jpg`;
    const filePath = `${userId}/${fileName}`;

    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      fileData = await response.blob();
    } else {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      fileData = blob;
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileData, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      throw uploadError;
    }

    const avatarUrl = getSupabaseStorageUrl('avatars', filePath);

    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar: avatarUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user avatar URL:', updateError);
      throw updateError;
    }

    console.log('Avatar uploaded and user record updated:', avatarUrl);
    return avatarUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}
