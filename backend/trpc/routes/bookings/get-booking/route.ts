import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { bookings, properties } from "../../../../db/schema";
import { eq } from "drizzle-orm";

const getBookingSchema = z.object({
  bookingId: z.string(),
});

export const getBookingProcedure = protectedProcedure
  .input(getBookingSchema)
  .query(async ({ input, ctx }) => {
    const [booking] = await db
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
      .where(eq(bookings.id, input.bookingId))
      .limit(1);

    if (!booking) {
      throw new Error("Booking not found");
    }

    const images = booking.propertyImage ? JSON.parse(booking.propertyImage) : [];

    return {
      booking: {
        ...booking,
        propertyImage: images[0] || "",
        date: booking.date,
      },
    };
  });
