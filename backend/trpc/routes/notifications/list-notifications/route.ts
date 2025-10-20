import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { notifications } from "../../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

const listNotificationsSchema = z.object({
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
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

    const totalCount = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(whereCondition);

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(whereCondition)
      .orderBy(desc(notifications.createdAt))
      .limit(input.limit)
      .offset(input.offset);

    const unreadCount = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.read, false)));

    console.log(`[List Notifications] User: ${ctx.user.id}, Count: ${userNotifications.length}, Unread: ${unreadCount.length}`);

    return {
      notifications: userNotifications,
      unreadCount: unreadCount.length,
      total: totalCount.length,
      hasMore: input.offset + input.limit < totalCount.length,
    };
  });
