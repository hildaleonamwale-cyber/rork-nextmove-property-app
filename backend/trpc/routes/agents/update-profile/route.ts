import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { agentProfiles } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const updateAgentProfileProcedure = protectedProcedure
  .input(
    z.object({
      package: z.enum(["free", "pro", "agency"]).optional(),
      accountSetupComplete: z.boolean().optional(),
      companyName: z.string().optional(),
      companyLogo: z.string().optional(),
      banner: z.string().optional(),
      bio: z.string().optional(),
      specialties: z.array(z.string()).optional(),
      yearsExperience: z.number().optional(),
      languages: z.array(z.string()).optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
      socialMedia: z.record(z.string(), z.string()).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const [existingProfile] = await db
      .select()
      .from(agentProfiles)
      .where(eq(agentProfiles.userId, ctx.user.id))
      .limit(1);

    if (!existingProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent profile not found. Create one first.",
      });
    }

    const updates: any = { updatedAt: new Date() };

    if (input.package !== undefined) updates.package = input.package;
    if (input.accountSetupComplete !== undefined)
      updates.accountSetupComplete = input.accountSetupComplete ? 1 : 0;
    if (input.companyName !== undefined) updates.companyName = input.companyName;
    if (input.companyLogo !== undefined) updates.companyLogo = input.companyLogo;
    if (input.banner !== undefined) updates.banner = input.banner;
    if (input.bio !== undefined) updates.bio = input.bio;
    if (input.specialties !== undefined)
      updates.specialties = JSON.stringify(input.specialties);
    if (input.yearsExperience !== undefined)
      updates.yearsExperience = input.yearsExperience;
    if (input.languages !== undefined)
      updates.languages = JSON.stringify(input.languages);
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.email !== undefined) updates.email = input.email;
    if (input.website !== undefined) updates.website = input.website;
    if (input.address !== undefined) updates.address = input.address;
    if (input.socialMedia !== undefined)
      updates.socialMedia = JSON.stringify(input.socialMedia);

    await db
      .update(agentProfiles)
      .set(updates)
      .where(eq(agentProfiles.userId, ctx.user.id));

    return { success: true };
  });
