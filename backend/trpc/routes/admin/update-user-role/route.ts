import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";


export const updateUserRoleProcedure = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      role: z.enum(["client", "agent", "agency", "admin"]),
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

    if (user.id === ctx.user.id && input.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot remove your own admin role",
      });
    }

    await db
      .update(users)
      .set({
        role: input.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.userId));

    return { success: true };
  });
