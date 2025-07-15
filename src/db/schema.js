import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    userId: serial("user_id").primaryKey(),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(), 
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// 定义枚举类型
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const statusEnum = pgEnum("status", ["pending", "in_progress", "completed"]);

// 定义todos表
export const todos = pgTable("todos", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
    categoryId: integer("category_id"),
    subcategoryId: integer("subcategory_id"),
    title: text("title").notNull(),
    description: text("description"),
    priority: priorityEnum("priority").default("medium"),
    status: statusEnum("status").default("pending"),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at")
});
