import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users, properties, bookings } from "@/backend/db/schema";
import { count, eq, sql } from "drizzle-orm";

export const getUserStatsProcedure = adminProcedure.query(async () => {
  const [totalUsers] = await db.select({ count: count() }).from(users);

  const [totalClients] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "client"));

  const [totalAgents] = await db
    .select({ count: count() })
    .from(users)
    .where(sql`${users.role} IN ('agent', 'agency')`);

  const [totalAdmins] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "admin"));

  const [verifiedUsers] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.verified, true));

  const [blockedUsers] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.blocked, true));

  const [totalProperties] = await db.select({ count: count() }).from(properties);

  const [totalBookings] = await db.select({ count: count() }).from(bookings);

  return {
    totalUsers: totalUsers?.count || 0,
    totalClients: totalClients?.count || 0,
    totalAgents: totalAgents?.count || 0,
    totalAdmins: totalAdmins?.count || 0,
    verifiedUsers: verifiedUsers?.count || 0,
    blockedUsers: blockedUsers?.count || 0,
    totalProperties: totalProperties?.count || 0,
    totalBookings: totalBookings?.count || 0,
  };
});
