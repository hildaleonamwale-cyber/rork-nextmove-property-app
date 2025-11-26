import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { wishlists, properties } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const listWishlistProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    console.log(`Fetching wishlist for user ${ctx.user.id}`);

    const wishlistItems = await db
      .select({
        wishlistId: wishlists.id,
        propertyId: wishlists.propertyId,
        addedAt: wishlists.createdAt,
        property: properties,
      })
      .from(wishlists)
      .leftJoin(properties, eq(wishlists.propertyId, properties.id))
      .where(eq(wishlists.userId, ctx.user.id))
      .all();

    const items = wishlistItems.map((item) => {
      if (!item.property) return null;
      
      return {
        wishlistId: item.wishlistId,
        addedAt: item.addedAt,
        property: {
          ...item.property,
          location: {
            address: item.property.address,
            city: item.property.city,
            province: item.property.state || '',
            country: item.property.country,
            coordinates: item.property.latitude && item.property.longitude ? {
              latitude: parseFloat(item.property.latitude),
              longitude: parseFloat(item.property.longitude),
            } : undefined,
          },
          images: JSON.parse(item.property.images),
          amenities: item.property.amenities
            ? JSON.parse(item.property.amenities)
            : [],
          features: [],
        },
      };
    }).filter(Boolean);

    console.log(`Found ${items.length} wishlist items`);

    return { wishlist: items };
  });
