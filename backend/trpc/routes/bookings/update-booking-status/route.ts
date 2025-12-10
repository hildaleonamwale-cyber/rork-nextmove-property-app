import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { bookings } from "../../../../db/schema";
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

    if (booking.agentId !== ctx.user.id && booking.clientId !== ctx.user.id) {
      throw new Error("Unauthorized to update this booking");
    }

    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, input.bookingId))
      .returning();

    console.log(`[Booking Updated] ID: ${input.bookingId}, Status: ${input.status}, By: ${ctx.user.id}`);

    return {
      success: true,
      booking: updatedBooking,
    };
  });
