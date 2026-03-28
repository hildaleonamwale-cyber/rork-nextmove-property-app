import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { properties } from "../../../../db/schema";
import { eq, sql } from "drizzle-orm";

export const incrementInquiriesProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    await ctx.db
      .update(properties)
      .set({
        inquiries: sql`${properties.inquiries} + 1`,
      })
      .where(eq(properties.id, input.id));

    return { success: true };
  });
