import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { agentProfiles, users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const getAgentProfileProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const [profile] = await db
      .select({
        id: agentProfiles.id,
        userId: agentProfiles.userId,
        packageLevel: agentProfiles.packageLevel,
        accountSetupComplete: agentProfiles.accountSetupComplete,
        companyName: agentProfiles.companyName,
        companyLogo: agentProfiles.companyLogo,
        banner: agentProfiles.banner,
        bio: agentProfiles.bio,
        specialties: agentProfiles.specialties,
        yearsOfExperience: agentProfiles.yearsOfExperience,
        languages: agentProfiles.languages,
        phone: agentProfiles.phone,
        email: agentProfiles.email,
        website: agentProfiles.website,
        address: agentProfiles.address,
        socialMedia: agentProfiles.socialMedia,
        followers: agentProfiles.followers,
        following: agentProfiles.following,
        verified: agentProfiles.verified,
        createdAt: agentProfiles.createdAt,
        updatedAt: agentProfiles.updatedAt,
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(agentProfiles)
      .innerJoin(users, eq(agentProfiles.userId, users.id))
      .where(eq(agentProfiles.userId, input.userId))
      .limit(1);

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent profile not found",
      });
    }

    return {
      ...profile,
      specialties: profile.specialties ? JSON.parse(profile.specialties) : [],
      languages: profile.languages ? JSON.parse(profile.languages) : [],
      socialMedia: profile.socialMedia ? JSON.parse(profile.socialMedia) : {},
    };
  });
