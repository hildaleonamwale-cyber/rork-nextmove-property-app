import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { agentProfiles } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

export const meProcedure = protectedProcedure.query(async ({ ctx }) => {
  const agentProfile = await db
    .select()
    .from(agentProfiles)
    .where(eq(agentProfiles.userId, ctx.user.id))
    .limit(1);

  return {
    id: ctx.user.id,
    email: ctx.user.email,
    name: ctx.user.name,
    role: ctx.user.role,
    phone: ctx.user.phone,
    avatar: ctx.user.avatar,
    verified: ctx.user.verified,
    blocked: ctx.user.blocked,
    createdAt: ctx.user.createdAt,
    lastActive: ctx.user.lastActive,
    accountTier: agentProfile[0]?.packageLevel || "free",
    hasAgentProfile: agentProfile.length > 0,
  };
});
