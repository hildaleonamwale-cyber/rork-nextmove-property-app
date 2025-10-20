import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { generateFileName, saveFile, validateImage } from "@/backend/utils/storage";

export const uploadImageProcedure = protectedProcedure
  .input(
    z.object({
      base64Data: z.string(),
      mimeType: z.string(),
      category: z.enum(['avatar', 'property', 'banner', 'document']).optional().default('property'),
    })
  )
  .mutation(async ({ input }) => {
    const base64Match = input.base64Data.match(/^data:(.+);base64,(.+)$/);
    
    if (!base64Match) {
      throw new Error('Invalid base64 data');
    }

    const mimeType = base64Match[1];
    const base64Content = base64Match[2];
    
    const buffer = Buffer.from(base64Content, 'base64');
    
    validateImage({ 
      size: buffer.length, 
      type: mimeType 
    });

    const ext = mimeType.split('/')[1];
    const filename = generateFileName(`image.${ext}`);
    
    const categoryDir = input.category === 'avatar' ? 'avatars' : 
                       input.category === 'banner' ? 'banners' :
                       input.category === 'document' ? 'documents' : 'properties';
    
    const fileUrl = await saveFile(buffer, filename, categoryDir);

    return {
      url: fileUrl,
      filename,
      size: buffer.length,
      mimeType,
    };
  });
