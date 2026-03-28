import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const updateProfileProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1).optional(),
      phone: z.string().optional(),
      avatar: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updates: any = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.avatar !== undefined) updates.avatar = input.avatar;

    if (Object.keys(updates).length === 0) {
      return { success: true };
    }

    updates.updatedAt = new Date();

    await db.update(users).set(updates).where(eq(users.id, ctx.user.id));

    return { success: true };
  });
