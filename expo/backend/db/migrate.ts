import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index";

export async function runMigrations() {
  console.log("🔄 Running migrations...");
  try {
    migrate(db, { migrationsFolder: "./backend/db/migrations" });
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("✅ Database is ready!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Migration failed:", err);
      process.exit(1);
    });
}
