import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { homepageSections } from "@/backend/db/schema";
import { asc } from "drizzle-orm";

export const listSectionsProcedure = publicProcedure.query(async () => {
  const allSections = await db
    .select()
    .from(homepageSections)
    .orderBy(asc(homepageSections.order));

  return allSections.map((section) => ({
    ...section,
    config: section.config ? JSON.parse(section.config) : {},
    analytics: section.analytics ? JSON.parse(section.analytics) : {},
  }));
});
