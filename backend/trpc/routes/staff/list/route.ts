import { protectedProcedure } from "../../create-context";
import { staff, agents } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const listStaffProcedure = protectedProcedure.query(async ({ ctx }) => {
  const agent = await ctx.db
    .select()
    .from(agents)
    .where(eq(agents.userId, ctx.user!.id))
    .get();

  if (!agent) {
    throw new Error("Agent profile not found");
  }

  const staffList = await ctx.db
    .select()
    .from(staff)
    .where(eq(staff.agentId, agent.id))
    .all();

  return staffList.map((member) => ({
    ...member,
    permissions: JSON.parse(member.permissions),
  }));
});
