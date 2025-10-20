import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { properties } from "../../../../db/schema";
import { eq, and, gte, lte, sql, or, like } from "drizzle-orm";

const listPropertiesInputSchema = z.object({
  listingCategory: z.enum(["property", "stand", "room", "commercial"]).optional(),
  status: z.array(z.enum(["For Rent", "For Sale", "Internal Management"])).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  location: z.string().optional(),
  verifiedOnly: z.boolean().optional(),
  featured: z.boolean().optional(),
  agentId: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export const listPropertiesProcedure = publicProcedure
  .input(listPropertiesInputSchema)
  .query(async ({ input, ctx }) => {
    const conditions: any[] = [];

    if (input.listingCategory) {
      conditions.push(eq(properties.listingCategory, input.listingCategory));
    }

    if (input.status && input.status.length > 0) {
      const statusConditions = input.status.map((s) => eq(properties.status, s));
      conditions.push(or(...statusConditions));
    }

    if (input.priceMin !== undefined) {
      conditions.push(gte(properties.price, input.priceMin));
    }

    if (input.priceMax !== undefined) {
      conditions.push(lte(properties.price, input.priceMax));
    }

    if (input.bedrooms !== undefined) {
      conditions.push(eq(properties.bedrooms, input.bedrooms));
    }

    if (input.bathrooms !== undefined) {
      conditions.push(eq(properties.bathrooms, input.bathrooms));
    }

    if (input.location) {
      conditions.push(like(properties.location, `%${input.location}%`));
    }

    if (input.verifiedOnly) {
      conditions.push(eq(properties.verified, true));
    }

    if (input.featured !== undefined) {
      conditions.push(eq(properties.featured, input.featured));
    }

    if (input.agentId) {
      conditions.push(eq(properties.agentId, input.agentId));
    }

    conditions.push(eq(properties.flagged, false));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await ctx.db.query.properties.findMany({
      where: whereClause,
      limit: input.limit,
      offset: input.offset,
      orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    });

    const total = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(whereClause);

    return {
      properties: results.map((property) => ({
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
      })),
      total: Number(total[0]?.count || 0),
      limit: input.limit,
      offset: input.offset,
    };
  });
