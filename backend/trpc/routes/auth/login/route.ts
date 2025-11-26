import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { verifyPassword, generateToken, generateTokenExpiry } from "@/backend/utils/auth";
import { users, sessions } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    if (user.blocked) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Your account has been blocked",
      });
    }

    const isValidPassword = await verifyPassword(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const token = generateToken();
    const expiresAt = generateTokenExpiry(24 * 7);

    await ctx.db.insert(sessions).values([
      {
        id: crypto.randomUUID(),
        userId: user.id,
        token,
        refreshToken: generateToken(),
        expiresAt,
        refreshExpiresAt: generateTokenExpiry(24 * 30),
      },
    ]);

    await ctx.db
      .update(users)
      .set({ lastActive: new Date() })
      .where(eq(users.id, user.id));

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountTier: "free" as const,
      },
      token,
    };
  });
