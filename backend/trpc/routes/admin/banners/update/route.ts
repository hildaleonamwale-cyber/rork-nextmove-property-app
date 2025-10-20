import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { banners } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const updateBannerProcedure = adminProcedure
  .input(
    z.object({
      id: z.string(),
      imageUrl: z.string().url().optional(),
      title: z.string().min(1).optional(),
      link: z.string().min(1).optional(),
      enabled: z.boolean().optional(),
      order: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { id, ...updates } = input;

    const [banner] = await db
      .update(banners)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(banners.id, id))
      .returning();

    return banner;
  });
