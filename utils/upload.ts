import { Platform } from 'react-native';
import { trpcClient } from '@/lib/trpc';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

async function fileToBase64(uri: string): Promise<{ base64Data: string; mimeType: string }> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          base64Data: reader.result as string,
          mimeType: blob.type,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        resolve({
          base64Data: reader.result as string,
          mimeType: blob.type || 'image/jpeg',
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export async function uploadImage(
  uri: string,
  category: 'avatar' | 'property' | 'banner' | 'document' = 'property'
): Promise<string> {
  try {
    const { base64Data, mimeType } = await fileToBase64(uri);
    
    const result = await trpcClient.uploads.uploadImage.mutate({
      base64Data,
      mimeType,
      category,
    });
    
    console.log('Image uploaded successfully:', result.url);
    return result.url;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error instanceof UploadError 
      ? error 
      : new UploadError('Failed to upload image. Please try again.');
  }
}

export async function uploadMultipleImages(
  uris: string[],
  category: 'avatar' | 'property' | 'banner' | 'document' = 'property'
): Promise<string[]> {
  try {
    const images = await Promise.all(
      uris.map(async (uri) => {
        const { base64Data, mimeType } = await fileToBase64(uri);
        return { base64Data, mimeType };
      })
    );

    const result = await trpcClient.uploads.uploadMultiple.mutate({
      images,
      category,
    });

    console.log(`Uploaded ${result.files.length} images successfully`);
    return result.files.map((f) => f.url);
  } catch (error) {
    console.error('Multiple image upload failed:', error);
    throw new UploadError('Failed to upload one or more images. Please try again.');
  }
}

export function validateImageFile(uri: string): boolean {
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const extension = uri.split('.').pop()?.toLowerCase();
  
  if (!extension || !validExtensions.includes(extension)) {
    throw new UploadError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
  }
  
  return true;
}

export function getImageFileSize(uri: string): Promise<number> {
  return new Promise((resolve, reject) => {
    if (Platform.OS === 'web') {
      fetch(uri)
        .then(response => response.blob())
        .then(blob => resolve(blob.size))
        .catch(reject);
    } else {
      resolve(0);
    }
  });
}
