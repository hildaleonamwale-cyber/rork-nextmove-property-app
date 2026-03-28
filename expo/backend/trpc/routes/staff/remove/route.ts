import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { staff, agents } from "@/backend/db/schema";
import { eq, and } from "drizzle-orm";

const removeStaffSchema = z.object({
  staffId: z.string(),
});

export const removeStaffProcedure = protectedProcedure
  .input(removeStaffSchema)
  .mutation(async ({ ctx, input }: { ctx: any; input: z.infer<typeof removeStaffSchema> }) => {
    const agent = await ctx.db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.user!.id))
      .get();

    if (!agent) {
      throw new Error("Agent profile not found");
    }

    const existingStaff = await ctx.db
      .select()
      .from(staff)
      .where(and(eq(staff.id, input.staffId), eq(staff.agentId, agent.id)))
      .get();

    if (!existingStaff) {
      throw new Error("Staff member not found");
    }

    await ctx.db.delete(staff).where(eq(staff.id, input.staffId));

    return { success: true };
  });
