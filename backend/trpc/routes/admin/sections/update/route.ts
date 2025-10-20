import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { homepageSections } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const updateSectionProcedure = adminProcedure
  .input(
    z.object({
      id: z.string(),
      type: z.enum(["featured_properties", "browse_properties", "featured_agencies", "custom"]).optional(),
      title: z.string().min(1).optional(),
      subtitle: z.string().optional(),
      icon: z.string().optional(),
      enabled: z.boolean().optional(),
      order: z.number().optional(),
      config: z.any().optional(),
      analytics: z.any().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { id, config, analytics, ...otherUpdates } = input;

    const updates: any = {
      ...otherUpdates,
      updatedAt: new Date(),
    };

    if (config !== undefined) {
      updates.config = JSON.stringify(config);
    }

    if (analytics !== undefined) {
      updates.analytics = analytics ? JSON.stringify(analytics) : null;
    }

    const [section] = await db
      .update(homepageSections)
      .set(updates)
      .where(eq(homepageSections.id, id))
      .returning();

    return {
      ...section,
      config: section.config ? JSON.parse(section.config) : {},
      analytics: section.analytics ? JSON.parse(section.analytics) : {},
    };
  });
