import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "../config/db.js";

// 运行迁移
async function runMigration() {
  try {
    console.log("开始数据库迁移...");
    await migrate(db, { migrationsFolder: "src/db/migrations" });
    console.log("数据库迁移成功完成！");
  } catch (error) {
    console.error("迁移过程中出错:", error);
    process.exit(1);
  }
  process.exit(0);
}

runMigration(); 