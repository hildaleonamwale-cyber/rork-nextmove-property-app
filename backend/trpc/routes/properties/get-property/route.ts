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
      location: JSON.parse(property.location),
      images: JSON.parse(property.images),
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      features: property.features ? JSON.parse(property.features) : [],
      lister: property.lister ? JSON.parse(property.lister) : null,
      verified: Boolean(property.verified),
      featured: Boolean(property.featured),
      titleDeeds: property.titleDeeds !== null ? Boolean(property.titleDeeds) : undefined,
      serviced: property.serviced !== null ? Boolean(property.serviced) : undefined,
      furnished: property.furnished !== null ? Boolean(property.furnished) : undefined,
      flagged: Boolean(property.flagged),
    };
  });
