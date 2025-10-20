import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { messages } from "../../../../db/schema";
import { nanoid } from "nanoid";

const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string(),
  images: z.array(z.string()).optional(),
});

export const sendMessageProcedure = protectedProcedure
  .input(sendMessageSchema)
  .mutation(async ({ input, ctx }) => {
    const messageId = nanoid();

    const [newMessage] = await db
      .insert(messages)
      .values({
        id: messageId,
        senderId: ctx.user.id,
        receiverId: input.receiverId,
        content: input.content,
        images: input.images ? JSON.stringify(input.images) : null,
        read: false,
        timestamp: new Date(),
      })
      .returning();

    console.log(`[Message Sent] ID: ${messageId}, From: ${ctx.user.id}, To: ${input.receiverId}`);

    return {
      success: true,
      message: {
        ...newMessage,
        images: newMessage.images ? JSON.parse(newMessage.images) : [],
      },
    };
  });
