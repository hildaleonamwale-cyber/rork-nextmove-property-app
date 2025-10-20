import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users, auditLogs } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

export const unblockUserProcedure = adminProcedure
  .input(
    z.object({
      userId: z.string(),
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
        blocked: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.userId));

    await db.insert(auditLogs).values({
      id: randomUUID(),
      adminId: ctx.user.id,
      adminName: ctx.user.name,
      action: "unblock_user",
      targetType: "user",
      targetId: input.userId,
      details: `Unblocked user ${user.name} (${user.email})`,
    });

    return { success: true };
  });
