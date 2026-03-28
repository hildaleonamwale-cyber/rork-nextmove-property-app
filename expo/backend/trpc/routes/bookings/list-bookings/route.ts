import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { bookings, properties } from "../../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

const listBookingsSchema = z.object({
  role: z.enum(["client", "agent"]).optional(),
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
});

export const listBookingsProcedure = protectedProcedure
  .input(listBookingsSchema)
  .query(async ({ input, ctx }) => {
    const conditions = [];
    
    conditions.push(eq(bookings.userId, ctx.user.id));

    if (input.status) {
      conditions.push(eq(bookings.status, input.status));
    }

    const totalCount = await db
      .select({ count: bookings.id })
      .from(bookings)
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .where(and(...conditions));

    const userBookings = await db
      .select({
        id: bookings.id,
        propertyId: bookings.propertyId,
        propertyTitle: properties.title,
        propertyImage: properties.images,
        date: bookings.date,
        time: bookings.time,
        clientName: bookings.clientName,
        clientEmail: bookings.clientEmail,
        clientPhone: bookings.clientPhone,
        notes: bookings.notes,
        status: bookings.status,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .where(and(...conditions))
      .orderBy(desc(bookings.createdAt))
      .limit(input.limit)
      .offset(input.offset);

    const formattedBookings = userBookings.map((booking) => {
      const images = booking.propertyImage ? JSON.parse(booking.propertyImage) : [];
      return {
        ...booking,
        propertyImage: images[0] || "",
        date: booking.date,
      };
    });

    console.log(`[List Bookings] User: ${ctx.user.id}, Count: ${formattedBookings.length}`);

    return {
      bookings: formattedBookings,
      total: totalCount.length,
      hasMore: input.offset + input.limit < totalCount.length,
    };
  });
