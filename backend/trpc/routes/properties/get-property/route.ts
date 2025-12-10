import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { properties } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const getPropertyProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const property = await ctx.db.query.properties.findFirst({
      where: eq(properties.id, input.id),
    });

    if (!property) {
      throw new Error("Property not found");
    }

    return {
      ...property,
      images: JSON.parse(property.images),
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
    };
  });
