import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { properties } from "../../../../db/schema";
import { eq, sql } from "drizzle-orm";

export const incrementViewsProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    await ctx.db
      .update(properties)
      .set({
        views: sql`${properties.views} + 1`,
      })
      .where(eq(properties.id, input.id));

    return { success: true };
  });
