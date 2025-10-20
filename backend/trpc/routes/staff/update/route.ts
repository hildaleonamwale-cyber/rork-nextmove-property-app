import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { staff, agents } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

const updateStaffSchema = z.object({
  staffId: z.string(),
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export const updateStaffProcedure = protectedProcedure
  .input(updateStaffSchema)
  .mutation(async ({ ctx, input }) => {
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

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.active !== undefined) updateData.active = input.active;
    if (input.permissions !== undefined)
      updateData.permissions = JSON.stringify(input.permissions);

    const updatedStaff = await ctx.db
      .update(staff)
      .set(updateData)
      .where(eq(staff.id, input.staffId))
      .returning()
      .get();

    return {
      ...updatedStaff,
      permissions: JSON.parse(updatedStaff.permissions),
    };
  });
