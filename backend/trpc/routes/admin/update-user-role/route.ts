import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users, auditLogs } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

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

    const oldRole = user.role;

    await db
      .update(users)
      .set({
        role: input.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.userId));

    await db.insert(auditLogs).values({
      id: randomUUID(),
      adminId: ctx.user.id,
      adminName: ctx.user.name,
      action: "update_user_role",
      targetType: "user",
      targetId: input.userId,
      details: `Changed role from ${oldRole} to ${input.role}`,
      metadata: JSON.stringify({ oldRole, newRole: input.role }),
    });

    return { success: true };
  });
