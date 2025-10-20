import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { managedProperties, agents } from "@/backend/db/schema";
import { eq, and } from "drizzle-orm";

const deleteManagedPropertySchema = z.object({
  propertyId: z.string(),
});

export const deleteManagedPropertyProcedure = protectedProcedure
  .input(deleteManagedPropertySchema)
  .mutation(async ({ ctx, input }: { ctx: any; input: z.infer<typeof deleteManagedPropertySchema> }) => {
    const agent = await ctx.db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.user!.id))
      .get();

    if (!agent) {
      throw new Error("Agent profile not found");
    }

    const existing = await ctx.db
      .select()
      .from(managedProperties)
      .where(
        and(
          eq(managedProperties.id, input.propertyId),
          eq(managedProperties.agentId, agent.id)
        )
      )
      .get();

    if (!existing) {
      throw new Error("Managed property not found");
    }

    await ctx.db
      .delete(managedProperties)
      .where(eq(managedProperties.id, input.propertyId));

    return { success: true };
  });
