import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { notifications } from "../../../../db/schema";


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


    const [newNotification] = await db
      .insert(notifications)
      .values({
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
        data: input.data || null,
        read: false,
        createdAt: new Date(),
      } as any)
      .returning();

    console.log(`[Notification Created] ID: ${newNotification.id}, User: ${input.userId}, Type: ${input.type}`);

    return {
      success: true,
      notification: newNotification,
    };
  });
