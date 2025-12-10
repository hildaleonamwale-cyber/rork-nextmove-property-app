import { adminProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db";
import { users, agents, properties, bookings } from "@/backend/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { z } from "zod";

export const listUsersProcedure = adminProcedure
  .input(
    z.object({
      role: z.enum(["client", "agent", "agency", "admin"]).optional(),
      search: z.string().optional(),
      blocked: z.boolean().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .query(async ({ input }) => {
    const conditions: any[] = [];

    if (input.role) {
      conditions.push(eq(users.role, input.role));
    }

    if (input.blocked !== undefined) {
      conditions.push(eq(users.blocked, input.blocked));
    }

    if (input.search) {
      conditions.push(
        sql`(${users.name} LIKE ${`%${input.search}%`} OR ${users.email} LIKE ${`%${input.search}%`})`
      );
    }

    const whereClause =
      conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const usersList = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        avatar: users.avatar,
        role: users.role,
        verified: users.verified,
        blocked: users.blocked,
        createdAt: users.createdAt,

      })
      .from(users)
      .where(whereClause)
      .limit(input.limit)
      .offset(input.offset);

    const usersWithStats = await Promise.all(
      usersList.map(async (user) => {
        const [propertiesCount] = await db
          .select({ count: count() })
          .from(properties)
          .where(eq(properties.agentId, user.id));

        const [bookingsCount] = await db
          .select({ count: count() })
          .from(bookings)
          .where(eq(bookings.userId, user.id));

        const [agentProfile] = await db
          .select({ packageLevel: agents.packageLevel })
          .from(agents)
          .where(eq(agents.userId, user.id))
          .limit(1);

        return {
          ...user,
          propertiesCount: propertiesCount?.count || 0,
          bookingsCount: bookingsCount?.count || 0,
          accountTier: agentProfile?.packageLevel || "free",
        };
      })
    );

    return usersWithStats;
  });
