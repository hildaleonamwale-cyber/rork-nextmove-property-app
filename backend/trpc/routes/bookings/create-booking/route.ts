import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { bookings, properties } from "../../../../db/schema";

import { eq } from "drizzle-orm";

const createBookingSchema = z.object({
  propertyId: z.string(),
  date: z.string(),
  time: z.string(),
  clientName: z.string(),
  clientEmail: z.string().email(),
  clientPhone: z.string(),
  notes: z.string().optional(),
});

export const createBookingProcedure = protectedProcedure
  .input(createBookingSchema)
  .mutation(async ({ input, ctx }) => {
    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, input.propertyId))
      .limit(1);

    if (!property[0]) {
      throw new Error("Property not found");
    }



    const [newBooking] = await db
      .insert(bookings)
      .values({
        propertyId: input.propertyId,
        userId: ctx.user.id,
        agentId: property[0].agentId,
        propertyTitle: property[0].title,
        date: input.date,
        time: input.time,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        notes: input.notes || null,
        status: "pending",
        createdAt: new Date(),
      } as any)
      .returning();



    console.log(`[Booking Created] ID: ${newBooking.id}, Property: ${input.propertyId}, Client: ${ctx.user.id}`);

    return {
      success: true,
      booking: newBooking,
    };
  });
