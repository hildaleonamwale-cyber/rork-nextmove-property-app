import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { homepageSections } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const deleteSectionProcedure = adminProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    await db.delete(homepageSections).where(eq(homepageSections.id, input.id));

    return { success: true };
  });
