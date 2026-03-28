import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { agents, users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const getAgentProfileProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const [profile] = await db
      .select({
        id: agents.id,
        userId: agents.userId,
        packageLevel: agents.packageLevel,
        companyName: agents.companyName,
        bio: agents.bio,
        specialization: agents.specialization,
        licenseNumber: agents.licenseNumber,
        yearsOfExperience: agents.yearsOfExperience,
        areasServed: agents.areasServed,
        website: agents.website,
        facebook: agents.facebook,
        twitter: agents.twitter,
        instagram: agents.instagram,
        linkedin: agents.linkedin,
        rating: agents.rating,
        reviewCount: agents.reviewCount,
        createdAt: agents.createdAt,
        updatedAt: agents.updatedAt,
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(agents)
      .innerJoin(users, eq(agents.userId, users.id))
      .where(eq(agents.userId, input.userId))
      .limit(1);

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent profile not found",
      });
    }

    return {
      ...profile,
      specialties: profile.specialization ? profile.specialization.split(", ") : [],
      package: profile.packageLevel,
    };
  });
