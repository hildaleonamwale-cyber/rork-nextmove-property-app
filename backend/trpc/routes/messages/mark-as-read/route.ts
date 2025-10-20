import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { messages } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

const markAsReadSchema = z.object({
  senderId: z.string(),
});

export const markAsReadProcedure = protectedProcedure
  .input(markAsReadSchema)
  .mutation(async ({ input, ctx }) => {
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.receiverId, ctx.user.id),
          eq(messages.senderId, input.senderId),
          eq(messages.read, false)
        )
      );

    console.log(`[Messages Marked as Read] User: ${ctx.user.id}, From: ${input.senderId}`);

    return {
      success: true,
    };
  });
