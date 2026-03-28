import { protectedProcedure } from "@/backend/trpc/create-context";
import { sessions } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const logoutProcedure = protectedProcedure
  .input(
    z.object({
      token: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    await ctx.db.delete(sessions).where(eq(sessions.token, input.token));

    return { success: true };
  });
