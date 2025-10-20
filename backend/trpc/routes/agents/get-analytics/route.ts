import { protectedProcedure } from "../../create-context";
import { agents, properties, bookings } from "../../../db/schema";
import { eq, and, sql } from "drizzle-orm";

export const getAnalyticsProcedure = protectedProcedure.query(async ({ ctx }) => {
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
    (sum, prop) => sum + (prop.views || 0),
    0
  );
  const totalInquiries = agentProperties.reduce(
    (sum, prop) => sum + (prop.inquiries || 0),
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

  const thisMonthViews = agentProperties.reduce((sum, prop) => {
    return sum + (prop.views || 0);
  }, 0);

  const thisMonthInquiries = agentProperties.reduce((sum, prop) => {
    return sum + (prop.inquiries || 0);
  }, 0);

  const thisMonthBookings = allBookings.filter((booking) => {
    return new Date(booking.createdAt) >= currentMonthStart;
  }).length;

  const propertyViews = agentProperties.map((prop) => ({
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
