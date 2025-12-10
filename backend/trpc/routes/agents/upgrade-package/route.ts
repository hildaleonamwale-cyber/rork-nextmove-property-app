import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { agents } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const upgradePackageProcedure = protectedProcedure
  .input(
    z.object({
      package: z.enum(["free", "pro", "agency"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const [existingProfile] = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.user.id))
      .limit(1);

    if (!existingProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent profile not found",
      });
    }

    await db
      .update(agents)
      .set({
        packageLevel: input.package,
      })
      .where(eq(agents.userId, ctx.user.id));

    return { success: true };
  });
