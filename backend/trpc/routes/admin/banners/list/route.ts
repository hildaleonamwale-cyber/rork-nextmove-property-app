import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { banners } from "@/backend/db/schema";
import { asc } from "drizzle-orm";

export const listBannersProcedure = publicProcedure.query(async () => {
  const allBanners = await db
    .select()
    .from(banners)
    .orderBy(asc(banners.order));

  return allBanners;
});
