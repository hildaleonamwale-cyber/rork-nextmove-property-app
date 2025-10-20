import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { notifications } from "../../../../db/schema";
import { nanoid } from "nanoid";

const createNotificationSchema = z.object({
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["booking", "message", "update", "system", "alert"]),
  data: z.string().optional(),
});

export const createNotificationProcedure = protectedProcedure
  .input(createNotificationSchema)
  .mutation(async ({ input, ctx }) => {
    const notificationId = nanoid();

    const [newNotification] = await db
      .insert(notifications)
      .values({
        id: notificationId,
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
        data: input.data || null,
        read: false,
        timestamp: new Date(),
      })
      .returning();

    console.log(`[Notification Created] ID: ${notificationId}, User: ${input.userId}, Type: ${input.type}`);

    return {
      success: true,
      notification: newNotification,
    };
  });
