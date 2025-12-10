import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { agentProfiles } from "@/backend/db/schema";
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
      .from(agentProfiles)
      .where(eq(agentProfiles.userId, ctx.user.id))
      .limit(1);

    if (!existingProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent profile not found",
      });
    }

    await db
      .update(agentProfiles)
      .set({
        package: input.package,
        updatedAt: new Date(),
      })
      .where(eq(agentProfiles.userId, ctx.user.id));

    return { success: true };
  });
