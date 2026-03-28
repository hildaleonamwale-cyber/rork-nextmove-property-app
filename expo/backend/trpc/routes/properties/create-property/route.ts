import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { properties } from "../../../../db/schema";



const createPropertyInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  priceType: z.enum(["monthly", "total"]),
  images: z.array(z.string()).min(1),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  area: z.number().positive().optional(),
  areaUnit: z.string().optional(),
  propertyType: z.string(),
  listingCategory: z.enum(["property", "stand", "room", "commercial"]).default("property"),
  status: z.enum(["For Rent", "For Sale", "Internal Management"]),
  amenities: z.array(z.string()).optional(),
  furnished: z.boolean().optional(),
  parking: z.boolean().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  zipCode: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  featured: z.boolean().optional(),
});

export const createPropertyProcedure = protectedProcedure
  .input(createPropertyInputSchema)
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    const userRole = ctx.user.role;

    if (userRole !== "agent" && userRole !== "agency" && userRole !== "admin") {
      throw new Error("Only agents, agencies, and admins can create properties");
    }

    const agentProfile = await ctx.db.query.agents.findFirst({
      where: (agents, { eq }) => eq(agents.userId, userId),
    });

    if (!agentProfile) {
      throw new Error("Agent profile not found");
    }

    const [newProperty] = await ctx.db.insert(properties).values({
      title: input.title,
      description: input.description,
      price: input.price,
      priceType: input.priceType,
      images: JSON.stringify(input.images),
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
      area: input.area ?? null,
      areaUnit: input.areaUnit ?? null,
      propertyType: input.propertyType,
      listingCategory: input.listingCategory,
      status: input.status,
      amenities: input.amenities ? JSON.stringify(input.amenities) : null,
      furnished: input.furnished ?? null,
      parking: input.parking ?? null,
      address: input.address,
      city: input.city,
      state: input.state ?? null,
      country: input.country,
      zipCode: input.zipCode ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      featured: input.featured ?? false,
      agentId: agentProfile.id,
      userId: userId,
    }).returning();

    return {
      success: true,
      property: {
        ...newProperty,
        images: JSON.parse(newProperty.images),
        amenities: newProperty.amenities ? JSON.parse(newProperty.amenities) : [],
      },
    };
  });
