import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { bookings, properties } from "../../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

const listBookingsSchema = z.object({
  role: z.enum(["client", "agent"]).optional(),
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
});

export const listBookingsProcedure = protectedProcedure
  .input(listBookingsSchema)
  .query(async ({ input, ctx }) => {
    const isAgent = input.role === "agent" || ctx.user.role === "agent";

    const conditions = [];
    
    if (isAgent) {
      conditions.push(eq(bookings.agentId, ctx.user.id));
    } else {
      conditions.push(eq(bookings.clientId, ctx.user.id));
    }

    if (input.status) {
      conditions.push(eq(bookings.status, input.status));
    }

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
      .orderBy(desc(bookings.createdAt));

    const formattedBookings = userBookings.map((booking) => {
      const images = booking.propertyImage ? JSON.parse(booking.propertyImage) : [];
      return {
        ...booking,
        propertyImage: images[0] || "",
        date: booking.date.toISOString().split('T')[0],
      };
    });

    console.log(`[List Bookings] User: ${ctx.user.id}, Role: ${isAgent ? 'agent' : 'client'}, Count: ${formattedBookings.length}`);

    return {
      bookings: formattedBookings,
    };
  });
