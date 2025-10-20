import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users, auditLogs } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

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

    await db.insert(auditLogs).values({
      id: randomUUID(),
      adminId: ctx.user.id,
      adminName: ctx.user.name,
      action: "block_user",
      targetType: "user",
      targetId: input.userId,
      details: `Blocked user ${user.name} (${user.email})`,
      metadata: JSON.stringify({ reason: input.reason }),
    });

    return { success: true };
  });
