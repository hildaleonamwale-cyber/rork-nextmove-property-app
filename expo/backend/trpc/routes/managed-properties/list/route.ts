import { protectedProcedure } from "@/backend/trpc/create-context";
import { managedProperties, agents } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

export const listManagedPropertiesProcedure = protectedProcedure.query(
  async ({ ctx }: { ctx: any }) => {
    const agent = await ctx.db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.user!.id))
      .get();

    if (!agent) {
      throw new Error("Agent profile not found");
    }

    const properties = await ctx.db
      .select()
      .from(managedProperties)
      .where(eq(managedProperties.agentId, agent.id))
      .all();

    return properties.map((property: any) => ({
      ...property,
      images: property.images ? JSON.parse(property.images) : [],
      documents: property.documents ? JSON.parse(property.documents) : [],
    }));
  }
);
