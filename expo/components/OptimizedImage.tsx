import React from 'react';
import { Image } from 'expo-image';
import { ImageStyle } from 'react-native';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: ImageStyle | ImageStyle[];
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: 'high' | 'normal' | 'low';
  placeholder?: string;
  transition?: number;
}

export default function OptimizedImage({
  source,
  style,
  contentFit = 'cover',
  priority = 'normal',
  placeholder,
  transition = 300,
}: OptimizedImageProps) {
  return (
    <Image
      source={source}
      style={style}
      contentFit={contentFit}
      priority={priority}
      placeholder={placeholder}
      transition={transition}
      cachePolicy="memory-disk"
    />
  );
}

const blurhash = 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH';
export { blurhash };
