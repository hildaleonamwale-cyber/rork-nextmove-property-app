import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";


export const blockUserProcedure = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      reason: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (user.id === ctx.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot block yourself",
      });
    }

    await db
      .update(users)
      .set({
        blocked: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.userId));

    return { success: true };
  });
