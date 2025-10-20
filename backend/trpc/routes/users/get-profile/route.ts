import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const getProfileProcedure = protectedProcedure
  .input(z.object({ userId: z.string().optional() }))
  .query(async ({ ctx, input }) => {
    const targetUserId = input.userId || ctx.user.id;

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        avatar: users.avatar,
        role: users.role,
        verified: users.verified,
        blocked: users.blocked,
        createdAt: users.createdAt,
        lastActive: users.lastActive,
      })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  });
