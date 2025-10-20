import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { notifications } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

const markAsReadSchema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional().default(false),
});

export const markAsReadProcedure = protectedProcedure
  .input(markAsReadSchema)
  .mutation(async ({ input, ctx }) => {
    if (input.markAll) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.userId, ctx.user.id),
            eq(notifications.read, false)
          )
        );

      console.log(`[Notifications Marked as Read] User: ${ctx.user.id}, All notifications`);
    } else if (input.notificationId) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, ctx.user.id)
          )
        );

      console.log(`[Notification Marked as Read] User: ${ctx.user.id}, Notification: ${input.notificationId}`);
    }

    return {
      success: true,
    };
  });
