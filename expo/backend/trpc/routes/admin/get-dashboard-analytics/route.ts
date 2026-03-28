import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users, properties, bookings, agents } from "@/backend/db/schema";
import { count, eq, sql, gte, and } from "drizzle-orm";

export const getDashboardAnalyticsProcedure = adminProcedure.query(async () => {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [totalUsers] = await db.select({ count: count() }).from(users);
  
  const [totalAgents] = await db
    .select({ count: count() })
    .from(users)
    .where(sql`${users.role} IN ('agent', 'agency')`);

  const [totalAgencies] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "agency"));

  const [totalProperties] = await db.select({ count: count() }).from(properties);
  
  const [totalBookings] = await db.select({ count: count() }).from(bookings);
  
  const [activeListings] = await db
    .select({ count: count() })
    .from(properties)
    .where(sql`${properties.status} IN ('For Rent', 'For Sale')`);

  const [blockedUsers] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.blocked, true));

  const [newUsersThisMonth] = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.createdAt, oneMonthAgo));

  const [newUsersLastMonth] = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        gte(users.createdAt, twoMonthsAgo),
        sql`${users.createdAt} < ${oneMonthAgo}`
      )
    );

  const [bookingsThisWeek] = await db
    .select({ count: count() })
    .from(bookings)
    .where(gte(bookings.createdAt, oneWeekAgo));

  const [bookingsLastWeek] = await db
    .select({ count: count() })
    .from(bookings)
    .where(
      and(
        gte(bookings.createdAt, twoWeeksAgo),
        sql`${bookings.createdAt} < ${oneWeekAgo}`
      )
    );

  const [listingsThisMonth] = await db
    .select({ count: count() })
    .from(properties)
    .where(gte(properties.createdAt, oneMonthAgo));

  const [listingsLastMonth] = await db
    .select({ count: count() })
    .from(properties)
    .where(
      and(
        gte(properties.createdAt, twoMonthsAgo),
        sql`${properties.createdAt} < ${oneMonthAgo}`
      )
    );

  const [clientsCount] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "client"));

  const [freeUsers] = await db
    .select({ count: count() })
    .from(agents)
    .where(eq(agents.packageLevel, "free"));

  const [proUsers] = await db
    .select({ count: count() })
    .from(agents)
    .where(eq(agents.packageLevel, "pro"));

  const [agencyUsers] = await db
    .select({ count: count() })
    .from(agents)
    .where(eq(agents.packageLevel, "agency"));

  const propertiesByType = await db
    .select({
      propertyType: properties.propertyType,
      count: count(),
    })
    .from(properties)
    .groupBy(properties.propertyType);

  const propertiesByStatus = await db
    .select({
      status: properties.status,
      count: count(),
    })
    .from(properties)
    .groupBy(properties.status);

  const propertiesTypeMap = propertiesByType.reduce((acc, item) => {
    if (item.propertyType) {
      acc[item.propertyType] = item.count;
    }
    return acc;
  }, {} as Record<string, number>);

  const propertiesStatusMap = propertiesByStatus.reduce((acc, item) => {
    acc[item.status] = item.count;
    return acc;
  }, {} as Record<string, number>);

  return {
    overview: {
      totalUsers: totalUsers?.count || 0,
      totalAgents: totalAgents?.count || 0,
      totalAgencies: totalAgencies?.count || 0,
      totalProperties: totalProperties?.count || 0,
      totalBookings: totalBookings?.count || 0,
      activeListings: activeListings?.count || 0,
      flaggedContent: 0,
      blockedUsers: blockedUsers?.count || 0,
    },
    trends: {
      newUsersThisMonth: newUsersThisMonth?.count || 0,
      newUsersLastMonth: newUsersLastMonth?.count || 0,
      bookingsThisWeek: bookingsThisWeek?.count || 0,
      bookingsLastWeek: bookingsLastWeek?.count || 0,
      listingsThisMonth: listingsThisMonth?.count || 0,
      listingsLastMonth: listingsLastMonth?.count || 0,
    },
    usersByRole: {
      clients: clientsCount?.count || 0,
      agents: totalAgents?.count || 0,
      agencies: totalAgencies?.count || 0,
    },
    usersByPackage: {
      free: freeUsers?.count || 0,
      pro: proUsers?.count || 0,
      agency: agencyUsers?.count || 0,
    },
    propertiesByType: {
      apartment: propertiesTypeMap["apartment"] || 0,
      house: propertiesTypeMap["house"] || 0,
      villa: propertiesTypeMap["villa"] || 0,
      condo: propertiesTypeMap["condo"] || 0,
      commercial: propertiesTypeMap["commercial"] || 0,
    },
    propertiesByStatus: {
      forRent: propertiesStatusMap["For Rent"] || 0,
      forSale: propertiesStatusMap["For Sale"] || 0,
      managed: propertiesStatusMap["Internal Management"] || 0,
      vacant: 0,
      occupied: 0,
    },
    recentActivity: [],
  };
});
