import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { wishlists } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

export const removeFromWishlistProcedure = protectedProcedure
  .input(
    z.object({
      propertyId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log(`Removing property ${input.propertyId} from wishlist for user ${ctx.user.id}`);

    await db
      .delete(wishlists)
      .where(
        and(
          eq(wishlists.userId, ctx.user.id),
          eq(wishlists.propertyId, input.propertyId)
        )
      )
      .run();

    console.log(`Property removed from wishlist successfully`);

    return { message: "Removed from wishlist" };
  });
