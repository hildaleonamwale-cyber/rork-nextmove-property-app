import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { properties } from "../../../../db/schema";
import { eq } from "drizzle-orm";

const updatePropertyInputSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  priceType: z.enum(["monthly", "total"]).optional(),
  images: z.array(z.string()).min(1).optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  area: z.number().positive().optional(),
  areaUnit: z.string().optional(),
  propertyType: z.string().optional(),
  listingCategory: z.enum(["property", "stand", "room", "commercial"]).optional(),
  status: z.enum(["For Rent", "For Sale", "Internal Management"]).optional(),
  amenities: z.array(z.string()).optional(),
  furnished: z.boolean().optional(),
  parking: z.boolean().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  featured: z.boolean().optional(),
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
    if (updateData.images !== undefined) updatePayload.images = JSON.stringify(updateData.images);
    if (updateData.bedrooms !== undefined) updatePayload.bedrooms = updateData.bedrooms;
    if (updateData.bathrooms !== undefined) updatePayload.bathrooms = updateData.bathrooms;
    if (updateData.area !== undefined) updatePayload.area = updateData.area;
    if (updateData.areaUnit !== undefined) updatePayload.areaUnit = updateData.areaUnit;
    if (updateData.propertyType !== undefined) updatePayload.propertyType = updateData.propertyType;
    if (updateData.listingCategory !== undefined) updatePayload.listingCategory = updateData.listingCategory;
    if (updateData.status !== undefined) updatePayload.status = updateData.status;
    if (updateData.amenities !== undefined) updatePayload.amenities = JSON.stringify(updateData.amenities);
    if (updateData.furnished !== undefined) updatePayload.furnished = updateData.furnished;
    if (updateData.parking !== undefined) updatePayload.parking = updateData.parking;
    if (updateData.address !== undefined) updatePayload.address = updateData.address;
    if (updateData.city !== undefined) updatePayload.city = updateData.city;
    if (updateData.state !== undefined) updatePayload.state = updateData.state;
    if (updateData.country !== undefined) updatePayload.country = updateData.country;
    if (updateData.zipCode !== undefined) updatePayload.zipCode = updateData.zipCode;
    if (updateData.latitude !== undefined) updatePayload.latitude = updateData.latitude;
    if (updateData.longitude !== undefined) updatePayload.longitude = updateData.longitude;
    if (updateData.featured !== undefined) updatePayload.featured = updateData.featured;

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
        images: JSON.parse(updatedProperty.images),
        amenities: updatedProperty.amenities ? JSON.parse(updatedProperty.amenities) : [],
      },
    };
  });
