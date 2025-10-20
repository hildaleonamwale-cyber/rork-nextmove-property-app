import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { notifications } from "../../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

const listNotificationsSchema = z.object({
  limit: z.number().optional().default(50),
  unreadOnly: z.boolean().optional().default(false),
});

export const listNotificationsProcedure = protectedProcedure
  .input(listNotificationsSchema)
  .query(async ({ input, ctx }) => {
    const conditions = [eq(notifications.userId, ctx.user.id)];
    
    if (input.unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }

    const whereCondition = input.unreadOnly
      ? and(eq(notifications.userId, ctx.user.id), eq(notifications.read, false))
      : eq(notifications.userId, ctx.user.id);

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(whereCondition)
      .orderBy(desc(notifications.timestamp))
      .limit(input.limit);

    const unreadCount = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.read, false)));

    console.log(`[List Notifications] User: ${ctx.user.id}, Count: ${userNotifications.length}, Unread: ${unreadCount.length}`);

    return {
      notifications: userNotifications,
      unreadCount: unreadCount.length,
    };
  });
