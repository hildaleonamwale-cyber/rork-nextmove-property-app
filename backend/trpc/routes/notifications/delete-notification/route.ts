import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { notifications } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

const deleteNotificationSchema = z.object({
  notificationId: z.string(),
});

export const deleteNotificationProcedure = protectedProcedure
  .input(deleteNotificationSchema)
  .mutation(async ({ input, ctx }) => {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, input.notificationId),
          eq(notifications.userId, ctx.user.id)
        )
      );

    console.log(`[Notification Deleted] User: ${ctx.user.id}, Notification: ${input.notificationId}`);

    return {
      success: true,
    };
  });
