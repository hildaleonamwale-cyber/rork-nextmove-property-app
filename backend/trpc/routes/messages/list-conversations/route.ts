import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { messages, users } from "../../../../db/schema";
import { eq, or, desc } from "drizzle-orm";

export const listConversationsProcedure = protectedProcedure.query(
  async ({ ctx }) => {
    const userMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        read: messages.read,
        createdAt: messages.createdAt,
        senderName: users.name,
        senderAvatar: users.avatar,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        or(eq(messages.senderId, ctx.user.id), eq(messages.receiverId, ctx.user.id))
      )
      .orderBy(desc(messages.createdAt));

    const conversationsMap = new Map<
      string,
      {
        userId: string;
        userName: string | null;
        userAvatar: string | null;
        lastMessage: string;
        createdAt: Date;
        unreadCount: number;
      }
    >();

    for (const msg of userMessages) {
      const otherUserId =
        msg.senderId === ctx.user.id ? msg.receiverId : msg.senderId;
      const isUnread = msg.receiverId === ctx.user.id && !msg.read;

      if (!conversationsMap.has(otherUserId)) {
        const [otherUser] = await db
          .select({ name: users.name, avatar: users.avatar })
          .from(users)
          .where(eq(users.id, otherUserId))
          .limit(1);

        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          userName: otherUser?.name || null,
          userAvatar: otherUser?.avatar || null,
          lastMessage: msg.content,
          createdAt: msg.createdAt,
          unreadCount: isUnread ? 1 : 0,
        });
      } else {
        const existing = conversationsMap.get(otherUserId)!;
        if (isUnread) {
          existing.unreadCount++;
        }
      }
    }

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    console.log(`[List Conversations] User: ${ctx.user.id}, Count: ${conversations.length}`);

    return {
      conversations,
    };
  }
);
