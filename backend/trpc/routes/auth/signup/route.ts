import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { hashPassword, generateToken, generateTokenExpiry } from "@/backend/utils/auth";
import { users, sessions } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

export const signupProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().optional(),
      password: z.string().min(6, "Password must be at least 6 characters"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const existingUser = await ctx.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await hashPassword(input.password);

    const userId = crypto.randomUUID();
    const [newUser] = await ctx.db
      .insert(users)
      .values([
        {
          id: userId,
          email: input.email,
          passwordHash: hashedPassword,
          name: input.name,
          phone: input.phone,
          role: "client",
          verified: false,
          blocked: false,
        },
      ])
      .returning();

    const token = generateToken();
    const expiresAt = generateTokenExpiry(24 * 7);

    await ctx.db.insert(sessions).values([
      {
        id: crypto.randomUUID(),
        userId: newUser.id,
        token,
        refreshToken: generateToken(),
        expiresAt,
        refreshExpiresAt: generateTokenExpiry(24 * 30),
      },
    ]);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        accountTier: "free" as const,
      },
      token,
    };
  });
