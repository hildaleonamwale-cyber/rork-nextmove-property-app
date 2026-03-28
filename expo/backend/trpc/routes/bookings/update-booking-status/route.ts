import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { bookings, properties } from "../../../../db/schema";
import { eq } from "drizzle-orm";

const updateBookingStatusSchema = z.object({
  bookingId: z.string(),
  status: z.enum(["confirmed", "cancelled"]),
});

export const updateBookingStatusProcedure = protectedProcedure
  .input(updateBookingStatusSchema)
  .mutation(async ({ input, ctx }) => {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, input.bookingId))
      .limit(1);

    if (!booking) {
      throw new Error("Booking not found");
    }

    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, booking.propertyId))
      .limit(1);

    if (!property[0]) {
      throw new Error("Property not found");
    }

    if (property[0].agentId !== ctx.user.id && booking.userId !== ctx.user.id) {
      throw new Error("Unauthorized to update this booking");
    }

    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status: input.status,
      })
      .where(eq(bookings.id, input.bookingId))
      .returning();

    console.log(`[Booking Updated] ID: ${input.bookingId}, Status: ${input.status}, By: ${ctx.user.id}`);

    return {
      success: true,
      booking: updatedBooking,
    };
  });
