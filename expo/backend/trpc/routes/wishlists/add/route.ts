import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { wishlists } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export const addToWishlistProcedure = protectedProcedure
  .input(
    z.object({
      propertyId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log(`Adding property ${input.propertyId} to wishlist for user ${ctx.user.id}`);

    const existing = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, ctx.user.id),
          eq(wishlists.propertyId, input.propertyId)
        )
      )
      .get();

    if (existing) {
      return { message: "Already in wishlist", wishlist: existing };
    }

    const wishlist = {
      id: nanoid(),
      userId: ctx.user.id,
      propertyId: input.propertyId,
      createdAt: new Date(),
    };

    await db.insert(wishlists).values(wishlist).run();

    console.log(`Property added to wishlist successfully`);

    return { message: "Added to wishlist", wishlist };
  });
