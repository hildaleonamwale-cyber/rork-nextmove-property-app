import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { agentProfiles, users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

export const createAgentProfileProcedure = protectedProcedure
  .input(
    z.object({
      package: z.enum(["free", "pro", "agency"]).default("free"),
      companyName: z.string().optional(),
      bio: z.string().optional(),
      specialties: z.array(z.string()).optional(),
      yearsExperience: z.number().optional(),
      languages: z.array(z.string()).optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const [existingProfile] = await db
      .select()
      .from(agentProfiles)
      .where(eq(agentProfiles.userId, ctx.user.id))
      .limit(1);

    if (existingProfile) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Agent profile already exists",
      });
    }

    const profileId = randomUUID();

    await db.insert(agentProfiles).values({
      id: profileId,
      userId: ctx.user.id,
      package: input.package,
      accountSetupComplete: false,
      companyName: input.companyName,
      bio: input.bio,
      specialties: input.specialties ? JSON.stringify(input.specialties) : null,
      yearsExperience: input.yearsExperience,
      languages: input.languages ? JSON.stringify(input.languages) : null,
      phone: input.phone,
      email: input.email,
      website: input.website,
      address: input.address,
    });

    await db
      .update(users)
      .set({ role: "agent" })
      .where(eq(users.id, ctx.user.id));

    return { success: true, profileId };
  });
