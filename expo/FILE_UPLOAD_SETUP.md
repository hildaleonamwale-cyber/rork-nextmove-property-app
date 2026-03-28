# File Upload System Setup

This document describes the file upload system implemented for the real estate app.

## Overview

The system handles image uploads for:
- User avatars
- Property images
- Banner images
- Documents

## Backend Components

### 1. Storage Utility (`backend/utils/storage.ts`)

Core functionality:
- **File storage**: Local filesystem storage in `uploads/` directory
- **Directory structure**: Organized by category (avatars, properties, banners, documents)
- **File validation**: Size limits (10MB), MIME type validation
- **Security**: Random filename generation with cryptographic hashing
- **File operations**: Save, delete, read operations

### 2. tRPC Upload Routes

#### `uploads.uploadImage`
- Upload single image
- Input: base64 data, MIME type, category
- Returns: file URL, filename, size, MIME type

#### `uploads.uploadMultiple`
- Upload multiple images at once
- Input: array of images with base64 data, category
- Returns: array of uploaded file details

#### `uploads.deleteImage`
- Delete uploaded image
- Input: file URL
- Returns: success status

### 3. Static File Serving

Configured in `backend/hono.ts`:
- Route: `/uploads/*`
- Uses Hono's `serveStatic` middleware
- Serves files from `uploads/` directory

## Frontend Integration

### Upload Utility (`utils/upload.ts`)

Updated to use tRPC instead of direct HTTP:

```typescript
// Upload single image
const imageUrl = await uploadImage(uri, 'property');

// Upload multiple images
const imageUrls = await uploadMultipleImages(uris, 'property');

// Validate image
validateImageFile(uri);
```

### Categories

- `avatar`: User profile pictures
- `property`: Property listing images
- `banner`: Homepage/promotional banners
- `document`: Legal documents, PDFs, etc.

## File Structure

```
uploads/
├── avatars/       # User profile pictures
├── properties/    # Property images
├── banners/       # Banner images
├── documents/     # Documents and PDFs
└── temp/          # Temporary uploads
```

## Usage Examples

### Upload Avatar

```typescript
import { trpc } from '@/lib/trpc';

const uploadAvatar = async (imageUri: string) => {
  // Convert to base64
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  
  // Upload via tRPC
  const result = await trpc.uploads.uploadImage.mutate({
    base64Data: base64,
    mimeType: 'image/jpeg',
    category: 'avatar',
  });
  
  return result.url;
};
```

### Upload Property Images

```typescript
import { uploadMultipleImages } from '@/utils/upload';

const propertyImages = ['file://image1.jpg', 'file://image2.jpg'];
const imageUrls = await uploadMultipleImages(propertyImages, 'property');

// Use in property creation
const property = await trpc.properties.create.mutate({
  // ... other fields
  images: JSON.stringify(imageUrls),
});
```

### Delete Image

```typescript
import { trpc } from '@/lib/trpc';

await trpc.uploads.deleteImage.mutate({
  fileUrl: '/uploads/properties/1234567890-abc123.jpg',
});
```

## Security Features

1. **Authentication**: All upload routes require authentication (`protectedProcedure`)
2. **File validation**: 
   - Size limits (10MB max)
   - MIME type restrictions (JPEG, PNG, WEBP, GIF only)
3. **Random filenames**: Prevents filename collisions and path traversal
4. **Directory isolation**: Files organized in separate directories

## Configuration

### Environment Variables

No additional environment variables needed. Files are stored in local `uploads/` directory.

### File Size Limits

Current limit: 10MB per file

To modify, edit `backend/utils/storage.ts`:
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // Change this value
```

### Allowed MIME Types

Current: JPEG, PNG, WEBP, GIF

To modify, edit `backend/utils/storage.ts`:
```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];
```

## Testing

### Test Upload

```bash
# Start the backend
bun run backend/hono.ts

# Test upload endpoint (requires authentication)
curl -X POST http://localhost:3000/api/trpc/uploads.uploadImage \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "base64Data": "data:image/jpeg;base64,...",
    "mimeType": "image/jpeg",
    "category": "property"
  }'
```

## Production Considerations

For production deployment, consider:

1. **Cloud Storage**: Replace local storage with S3, Cloudinary, or similar
2. **CDN**: Serve images through CDN for better performance
3. **Image Optimization**: Add image compression/resizing
4. **Backup**: Regular backups of uploads directory
5. **Storage Limits**: Monitor disk space usage

## Next Steps

To enhance the upload system:

1. Add image resizing/compression
2. Implement CDN integration
3. Add image editing capabilities
4. Support video uploads
5. Add upload progress tracking
6. Implement batch upload queue
