import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const uploadAvatarProcedure = protectedProcedure
  .input(
    z.object({
      base64Image: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const avatarUrl = `data:image/jpeg;base64,${input.base64Image}`;

    await db
      .update(users)
      .set({
        avatar: avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.user.id));

    return { success: true, avatarUrl };
  });
