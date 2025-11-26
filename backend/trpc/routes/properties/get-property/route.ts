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
      location: {
        address: property.address,
        city: property.city,
        province: property.state || '',
        country: property.country,
        coordinates: property.latitude && property.longitude ? {
          latitude: parseFloat(property.latitude),
          longitude: parseFloat(property.longitude),
        } : undefined,
      },
      images: JSON.parse(property.images),
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      features: [],
      lister: null,
      featured: Boolean(property.featured),
      furnished: property.furnished !== null ? Boolean(property.furnished) : undefined,
      parking: property.parking !== null ? Boolean(property.parking) : undefined,
    };
  });
