import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { messages, users } from "../../../../db/schema";
import { eq, or, and, desc } from "drizzle-orm";

const getConversationSchema = z.object({
  otherUserId: z.string(),
  limit: z.number().optional().default(50),
});

export const getConversationProcedure = protectedProcedure
  .input(getConversationSchema)
  .query(async ({ input, ctx }) => {
    const conversation = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        images: messages.images,
        read: messages.read,
        timestamp: messages.timestamp,
        senderName: users.name,
        senderAvatar: users.avatar,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(
            eq(messages.senderId, ctx.user.id),
            eq(messages.receiverId, input.otherUserId)
          ),
          and(
            eq(messages.senderId, input.otherUserId),
            eq(messages.receiverId, ctx.user.id)
          )
        )
      )
      .orderBy(desc(messages.timestamp))
      .limit(input.limit);

    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.receiverId, ctx.user.id),
          eq(messages.senderId, input.otherUserId),
          eq(messages.read, false)
        )
      );

    const formattedMessages = conversation.map((msg) => ({
      ...msg,
      images: msg.images ? JSON.parse(msg.images) : [],
    })).reverse();

    console.log(`[Get Conversation] User: ${ctx.user.id}, Other: ${input.otherUserId}, Count: ${formattedMessages.length}`);

    return {
      messages: formattedMessages,
    };
  });
