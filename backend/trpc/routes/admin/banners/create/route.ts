import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { banners } from "@/backend/db/schema";
import { z } from "zod";

export const createBannerProcedure = adminProcedure
  .input(
    z.object({
      imageUrl: z.string().url(),
      title: z.string().min(1),
      link: z.string().min(1),
      enabled: z.boolean().default(true),
      order: z.number().default(0),
    })
  )
  .mutation(async ({ input }) => {
    const [banner] = await db
      .insert(banners)
      .values({
        imageUrl: input.imageUrl,
        title: input.title,
        link: input.link,
        enabled: input.enabled,
        order: input.order,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return banner;
  });
