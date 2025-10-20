import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { managedProperties, agents } from "@/backend/db/schema";
import { eq, and } from "drizzle-orm";

const updateManagedPropertySchema = z.object({
  propertyId: z.string(),
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  type: z.enum(["Residential", "Commercial"]).optional(),
  status: z
    .enum(["Vacant", "Occupied", "Under Maintenance", "For Sale"])
    .optional(),
  notes: z.string().optional(),
  images: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  tenantName: z.string().optional(),
  tenantPhone: z.string().optional(),
  tenantEmail: z.string().optional(),
  tenantMoveInDate: z.date().optional(),
  isListed: z.boolean().optional(),
  listedPropertyId: z.string().optional(),
});

export const updateManagedPropertyProcedure = protectedProcedure
  .input(updateManagedPropertySchema)
  .mutation(async ({ ctx, input }: { ctx: any; input: z.infer<typeof updateManagedPropertySchema> }) => {
    const agent = await ctx.db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.user!.id))
      .get();

    if (!agent) {
      throw new Error("Agent profile not found");
    }

    const existing = await ctx.db
      .select()
      .from(managedProperties)
      .where(
        and(
          eq(managedProperties.id, input.propertyId),
          eq(managedProperties.agentId, agent.id)
        )
      )
      .get();

    if (!existing) {
      throw new Error("Managed property not found");
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.images !== undefined)
      updateData.images = JSON.stringify(input.images);
    if (input.documents !== undefined)
      updateData.documents = JSON.stringify(input.documents);
    if (input.tenantName !== undefined) updateData.tenantName = input.tenantName;
    if (input.tenantPhone !== undefined)
      updateData.tenantPhone = input.tenantPhone;
    if (input.tenantEmail !== undefined)
      updateData.tenantEmail = input.tenantEmail;
    if (input.tenantMoveInDate !== undefined)
      updateData.tenantMoveInDate = input.tenantMoveInDate;
    if (input.isListed !== undefined) updateData.isListed = input.isListed;
    if (input.listedPropertyId !== undefined)
      updateData.listedPropertyId = input.listedPropertyId;

    const updated = await ctx.db
      .update(managedProperties)
      .set(updateData)
      .where(eq(managedProperties.id, input.propertyId))
      .returning()
      .get();

    return {
      ...updated,
      images: updated.images ? JSON.parse(updated.images) : [],
      documents: updated.documents ? JSON.parse(updated.documents) : [],
    };
  });
