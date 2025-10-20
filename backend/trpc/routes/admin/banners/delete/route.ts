import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { banners } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const deleteBannerProcedure = adminProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    await db.delete(banners).where(eq(banners.id, input.id));

    return { success: true };
  });
