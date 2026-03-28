import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { managedProperties, agents } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

const addManagedPropertySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  type: z.enum(["Residential", "Commercial"]).default("Residential"),
  status: z
    .enum(["Vacant", "Occupied", "Under Maintenance", "For Sale"])
    .default("Vacant"),
  notes: z.string().optional(),
  images: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  tenantName: z.string().optional(),
  tenantPhone: z.string().optional(),
  tenantEmail: z.string().optional(),
  tenantMoveInDate: z.date().optional(),
});

export const addManagedPropertyProcedure = protectedProcedure
  .input(addManagedPropertySchema)
  .mutation(async ({ ctx, input }: { ctx: any; input: z.infer<typeof addManagedPropertySchema> }) => {
    const agent = await ctx.db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.user!.id))
      .get();

    if (!agent) {
      throw new Error("Agent profile not found");
    }

    const newProperty = await ctx.db
      .insert(managedProperties)
      .values({
        agentId: agent.id,
        name: input.name,
        address: input.address,
        type: input.type,
        status: input.status,
        notes: input.notes,
        images: input.images ? JSON.stringify(input.images) : null,
        documents: input.documents ? JSON.stringify(input.documents) : null,
        tenantName: input.tenantName,
        tenantPhone: input.tenantPhone,
        tenantEmail: input.tenantEmail,
        tenantMoveInDate: input.tenantMoveInDate,
        isListed: false,
        listedPropertyId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();

    return {
      ...newProperty,
      images: newProperty.images ? JSON.parse(newProperty.images) : [],
      documents: newProperty.documents ? JSON.parse(newProperty.documents) : [],
    };
  });
