import { protectedProcedure } from "@/backend/trpc/create-context";
import { agents, properties, bookings } from "@/backend/db/schema";
import { eq, and, sql } from "drizzle-orm";

type Context = {
  db: any;
  user: { id: string } | null;
};

export const getAnalyticsProcedure = protectedProcedure.query(async ({ ctx }: { ctx: Context }) => {
  const agent = await ctx.db
    .select()
    .from(agents)
    .where(eq(agents.userId, ctx.user!.id))
    .get();

  if (!agent) {
    throw new Error("Agent profile not found");
  }

  const agentProperties = await ctx.db
    .select()
    .from(properties)
    .where(eq(properties.agentId, agent.id))
    .all();

  const totalViews = agentProperties.reduce(
    (sum: number, prop: any) => sum + (prop.views || 0),
    0
  );
  const totalInquiries = agentProperties.reduce(
    (sum: number, prop: any) => sum + (prop.inquiries || 0),
    0
  );

  const allBookings = await ctx.db
    .select()
    .from(bookings)
    .where(
      and(
        sql`${bookings.propertyId} IN (SELECT id FROM properties WHERE agent_id = ${agent.id})`
      )
    )
    .all();

  const totalBookings = allBookings.length;

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonthViews = agentProperties.reduce((sum: number, prop: any) => {
    return sum + (prop.views || 0);
  }, 0);

  const thisMonthInquiries = agentProperties.reduce((sum: number, prop: any) => {
    return sum + (prop.inquiries || 0);
  }, 0);

  const thisMonthBookings = allBookings.filter((booking: any) => {
    return new Date(booking.createdAt) >= currentMonthStart;
  }).length;

  const propertyViews = agentProperties.map((prop: any) => ({
    propertyId: prop.id,
    propertyName: prop.title,
    views: prop.views || 0,
  }));

  return {
    views: {
      total: totalViews,
      thisMonth: thisMonthViews,
      trend: 15,
    },
    inquiries: {
      total: totalInquiries,
      thisMonth: thisMonthInquiries,
      trend: 8,
    },
    bookings: {
      total: totalBookings,
      thisMonth: thisMonthBookings,
      trend: 12,
    },
    propertyViews,
  };
});
