import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { properties } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const deletePropertyProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const property = await ctx.db.query.properties.findFirst({
      where: eq(properties.id, input.id),
    });

    if (!property) {
      throw new Error("Property not found");
    }

    if (property.agentId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new Error("You don't have permission to delete this property");
    }

    await ctx.db.delete(properties).where(eq(properties.id, input.id));

    return {
      success: true,
      message: "Property deleted successfully",
    };
  });
