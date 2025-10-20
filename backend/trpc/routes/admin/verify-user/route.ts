import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";


export const verifyUserProcedure = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      verified: z.boolean(),
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

    await db
      .update(users)
      .set({
        verified: input.verified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.userId));

    return { success: true };
  });
