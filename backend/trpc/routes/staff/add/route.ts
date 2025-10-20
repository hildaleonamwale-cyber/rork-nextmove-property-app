import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { staff, agents } from "../../../db/schema";
import { eq } from "drizzle-orm";

const addStaffSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  permissions: z.array(z.string()),
  inviteToken: z.string().optional(),
  inviteExpiry: z.date().optional(),
});

export const addStaffProcedure = protectedProcedure
  .input(addStaffSchema)
  .mutation(async ({ ctx, input }) => {
    const agent = await ctx.db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.user!.id))
      .get();

    if (!agent) {
      throw new Error("Agent profile not found");
    }

    const newStaff = await ctx.db
      .insert(staff)
      .values({
        agentId: agent.id,
        name: input.name,
        role: input.role,
        email: input.email,
        phone: input.phone,
        permissions: JSON.stringify(input.permissions),
        active: false,
        inviteToken: input.inviteToken,
        inviteExpiry: input.inviteExpiry,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();

    return {
      ...newStaff,
      permissions: JSON.parse(newStaff.permissions),
    };
  });
