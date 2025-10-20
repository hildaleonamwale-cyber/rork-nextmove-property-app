import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { deleteFile } from "@/backend/utils/storage";

export const deleteImageProcedure = protectedProcedure
  .input(
    z.object({
      fileUrl: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    await deleteFile(input.fileUrl);
    
    return { success: true };
  });
