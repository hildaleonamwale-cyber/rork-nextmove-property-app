import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { db } from "@/backend/db";
import { sessions, users } from "@/backend/db/schema";
import { eq, and, gt } from "drizzle-orm";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  let user: typeof users.$inferSelect | null = null;

  if (token) {
    try {
      const session = await db.query.sessions.findFirst({
        where: and(
          eq(sessions.token, token),
          gt(sessions.expiresAt, new Date())
        ),
      });

      if (session) {
        user = await db.query.users.findFirst({
          where: eq(users.id, session.userId),
        }) || null;
      }
    } catch (error) {
      console.error("Error validating session:", error);
    }
  }

  return {
    req: opts.req,
    user,
    db,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});

export const agentProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "agent" && ctx.user.role !== "agency" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});
