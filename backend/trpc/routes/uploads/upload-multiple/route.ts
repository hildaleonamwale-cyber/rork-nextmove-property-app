import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { generateFileName, saveFile, validateImage } from "@/backend/utils/storage";

export const uploadMultipleProcedure = protectedProcedure
  .input(
    z.object({
      images: z.array(
        z.object({
          base64Data: z.string(),
          mimeType: z.string(),
        })
      ),
      category: z.enum(['avatar', 'property', 'banner', 'document']).optional().default('property'),
    })
  )
  .mutation(async ({ input }) => {
    const uploadedFiles: {
      url: string;
      filename: string;
      size: number;
      mimeType: string;
    }[] = [];

    for (const image of input.images) {
      const base64Match = image.base64Data.match(/^data:(.+);base64,(.+)$/);
      
      if (!base64Match) {
        continue;
      }

      const mimeType = base64Match[1];
      const base64Content = base64Match[2];
      
      const buffer = Buffer.from(base64Content, 'base64');
      
      try {
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

        uploadedFiles.push({
          url: fileUrl,
          filename,
          size: buffer.length,
          mimeType,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        continue;
      }
    }

    return { files: uploadedFiles };
  });
