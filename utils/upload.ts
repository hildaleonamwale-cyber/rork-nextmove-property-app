import { Platform } from 'react-native';
import { API_URL } from './api';
import { getAuthToken } from './auth';

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

export async function uploadImage(uri: string): Promise<string> {
  try {
    const token = await getAuthToken();
    
    const formData = new FormData();
    
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('file', blob, filename);
    } else {
      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);
    }

    const uploadResponse = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new UploadError(`Upload failed: ${errorText}`);
    }

    const data: UploadResponse = await uploadResponse.json();
    console.log('Image uploaded successfully:', data.url);
    
    return data.url;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error instanceof UploadError 
      ? error 
      : new UploadError('Failed to upload image. Please try again.');
  }
}

export async function uploadMultipleImages(uris: string[]): Promise<string[]> {
  try {
    const uploadPromises = uris.map(uri => uploadImage(uri));
    return await Promise.all(uploadPromises);
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
