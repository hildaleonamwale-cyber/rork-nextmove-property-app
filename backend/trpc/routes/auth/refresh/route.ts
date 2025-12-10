import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { generateToken, generateTokenExpiry } from "@/backend/utils/auth";
import { sessions, users } from "@/backend/db/schema";
import { eq, and, gt } from "drizzle-orm";

export const refreshProcedure = publicProcedure
  .input(
    z.object({
      token: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const session = await ctx.db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, input.token),
        gt(sessions.expiresAt, new Date())
      ),
    });

    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired session",
      });
    }

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    await ctx.db.delete(sessions).where(eq(sessions.id, session.id));

    const newToken = generateToken();
    const expiresAt = generateTokenExpiry(24 * 7);

    const refreshToken = generateToken();
    const refreshExpiresAt = generateTokenExpiry(24 * 30);

    await ctx.db.insert(sessions).values({
      userId: user.id,
      token: newToken,
      refreshToken,
      expiresAt,
      refreshExpiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountTier: "free" as const,
      },
      token: newToken,
    };
  });
