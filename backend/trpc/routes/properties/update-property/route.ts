import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { properties } from "../../../../db/schema";
import { eq } from "drizzle-orm";

const locationSchema = z.object({
  address: z.string(),
  area: z.string(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

const listerSchema = z.object({
  type: z.enum(["company", "private"]),
  companyName: z.string().optional(),
  companyLogo: z.string().optional(),
});

const updatePropertyInputSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  priceType: z.enum(["monthly", "sale"]).optional(),
  location: locationSchema.optional(),
  images: z.array(z.string()).min(1).optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  area: z.number().positive().optional(),
  propertyType: z.string().optional(),
  listingCategory: z.enum(["property", "stand", "room", "commercial"]).optional(),
  status: z.enum(["For Rent", "For Sale", "Internal Management"]).optional(),
  amenities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  tourLink: z.string().optional(),
  lister: listerSchema.optional(),
  floors: z.number().int().optional(),
  parkingSpaces: z.number().int().optional(),
  titleDeeds: z.boolean().optional(),
  serviced: z.boolean().optional(),
  developerSession: z.string().optional(),
  furnished: z.boolean().optional(),
  yearBuilt: z.number().int().optional(),
  zoning: z.string().optional(),
});

export const updatePropertyProcedure = protectedProcedure
  .input(updatePropertyInputSchema)
  .mutation(async ({ input, ctx }) => {
    const { id, ...updateData } = input;

    const property = await ctx.db.query.properties.findFirst({
      where: eq(properties.id, id),
    });

    if (!property) {
      throw new Error("Property not found");
    }

    if (property.agentId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new Error("You don't have permission to update this property");
    }

    const updatePayload: any = {};

    if (updateData.title !== undefined) updatePayload.title = updateData.title;
    if (updateData.description !== undefined) updatePayload.description = updateData.description;
    if (updateData.price !== undefined) updatePayload.price = updateData.price;
    if (updateData.priceType !== undefined) updatePayload.priceType = updateData.priceType;
    if (updateData.location !== undefined) {
      updatePayload.address = updateData.location.address;
      updatePayload.city = updateData.location.city;
      updatePayload.state = updateData.location.province;
      updatePayload.country = updateData.location.country;
      if (updateData.location.coordinates) {
        updatePayload.latitude = updateData.location.coordinates.latitude.toString();
        updatePayload.longitude = updateData.location.coordinates.longitude.toString();
      }
    }
    if (updateData.images !== undefined) updatePayload.images = JSON.stringify(updateData.images);
    if (updateData.bedrooms !== undefined) updatePayload.bedrooms = updateData.bedrooms;
    if (updateData.bathrooms !== undefined) updatePayload.bathrooms = updateData.bathrooms;
    if (updateData.area !== undefined) updatePayload.area = updateData.area;
    if (updateData.propertyType !== undefined) updatePayload.propertyType = updateData.propertyType;
    if (updateData.listingCategory !== undefined) updatePayload.listingCategory = updateData.listingCategory;
    if (updateData.status !== undefined) updatePayload.status = updateData.status;
    if (updateData.amenities !== undefined) updatePayload.amenities = JSON.stringify(updateData.amenities);
    if (updateData.furnished !== undefined) updatePayload.furnished = updateData.furnished;

    await ctx.db
      .update(properties)
      .set(updatePayload)
      .where(eq(properties.id, id));

    const updatedProperty = await ctx.db.query.properties.findFirst({
      where: eq(properties.id, id),
    });

    if (!updatedProperty) {
      throw new Error("Failed to fetch updated property");
    }

    return {
      success: true,
      property: {
        ...updatedProperty,
        location: {
          address: updatedProperty.address,
          city: updatedProperty.city,
          province: updatedProperty.state || '',
          country: updatedProperty.country,
          coordinates: updatedProperty.latitude && updatedProperty.longitude ? {
            latitude: parseFloat(updatedProperty.latitude),
            longitude: parseFloat(updatedProperty.longitude),
          } : undefined,
        },
        images: JSON.parse(updatedProperty.images),
        amenities: updatedProperty.amenities ? JSON.parse(updatedProperty.amenities) : [],
        features: updateData.features ?? [],
        lister: updateData.lister ?? null,
        featured: Boolean(updatedProperty.featured),
        furnished: updatedProperty.furnished !== null ? Boolean(updatedProperty.furnished) : undefined,
        parking: updatedProperty.parking !== null ? Boolean(updatedProperty.parking) : undefined,
      },
    };
  });
