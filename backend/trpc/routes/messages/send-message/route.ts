import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { messages } from "../../../../db/schema";


const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string(),
  images: z.array(z.string()).optional(),
});

export const sendMessageProcedure = protectedProcedure
  .input(sendMessageSchema)
  .mutation(async ({ input, ctx }) => {


    const [newMessage] = await db
      .insert(messages)
      .values({
        senderId: ctx.user.id,
        receiverId: input.receiverId,
        content: input.content,
        read: false,
        createdAt: new Date(),
      })
      .returning();

    console.log(`[Message Sent] ID: ${newMessage.id}, From: ${ctx.user.id}, To: ${input.receiverId}`);

    return {
      success: true,
      message: newMessage,
    };
  });
