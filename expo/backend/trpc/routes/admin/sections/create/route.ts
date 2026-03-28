import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { homepageSections } from "@/backend/db/schema";
import { z } from "zod";

export const createSectionProcedure = adminProcedure
  .input(
    z.object({
      type: z.enum(["featured_properties", "browse_properties", "featured_agencies", "custom"]),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      icon: z.string().optional(),
      enabled: z.boolean().default(true),
      order: z.number().default(0),
      config: z.any(),
      analytics: z.any().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const [section] = await db
      .insert(homepageSections)
      .values({
        type: input.type,
        title: input.title,
        subtitle: input.subtitle,
        icon: input.icon,
        enabled: input.enabled,
        order: input.order,
        config: JSON.stringify(input.config),
        analytics: input.analytics ? JSON.stringify(input.analytics) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return {
      ...section,
      config: section.config ? JSON.parse(section.config) : {},
      analytics: section.analytics ? JSON.parse(section.analytics) : {},
    };
  });
