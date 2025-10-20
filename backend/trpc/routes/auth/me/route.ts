import { protectedProcedure } from "@/backend/trpc/create-context";

export const meProcedure = protectedProcedure.query(async ({ ctx }) => {
  return {
    id: ctx.user.id,
    email: ctx.user.email,
    name: ctx.user.name,
    role: ctx.user.role,
    phone: ctx.user.phone,
    avatar: ctx.user.avatar,
    verified: ctx.user.verified,
    accountTier: "free" as const,
  };
});
