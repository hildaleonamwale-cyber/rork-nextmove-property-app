import { protectedProcedure } from "../../create-context";
import { managedProperties, agents } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const listManagedPropertiesProcedure = protectedProcedure.query(
  async ({ ctx }) => {
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

    return properties.map((property) => ({
      ...property,
      images: property.images ? JSON.parse(property.images) : [],
      documents: property.documents ? JSON.parse(property.documents) : [],
    }));
  }
);
