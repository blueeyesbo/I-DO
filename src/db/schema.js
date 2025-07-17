import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";

// 用户表
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

// 主分类表（categories）
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color", { length: 7 }).default("#667eea"),
    icon: text("icon", { length: 50 }).default("folder"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 子分类表（subcategories）
export const subcategories = pgTable("subcategories", {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color", { length: 7 }),
    icon: text("icon", { length: 50 }),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 定义important_dates相关枚举
export const importantDateTypeEnum = pgEnum("important_date_type", ["countdown", "anniversary", "deadline", "event"]);
export const recurringTypeEnum = pgEnum("recurring_type", ["daily", "weekly", "monthly", "yearly"]);

// 定义calendar_events相关枚举
export const calendarEventTypeEnum = pgEnum("calendar_event_type", ["todo", "event", "reminder", "deadline"]);
export const calendarEventStatusEnum = pgEnum("calendar_event_status", ["scheduled", "in_progress", "completed", "cancelled"]);

// 定义user_settings相关枚举
export const calendarViewEnum = pgEnum("default_calendar_view", ["month", "week", "day"]);

// 时间记录表（time_logs）
export const timeLogs = pgTable("time_logs", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
    todoId: integer("todo_id").references(() => todos.id, { onDelete: "set null" }),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    // duration_minutes 由数据库生成，不在ORM层定义
    description: text("description", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 重要日期/倒数日表（important_dates）
export const importantDates = pgTable("important_dates", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    title: text("title", { length: 255 }).notNull(),
    description: text("description"),
    targetDate: timestamp("target_date", { mode: "date" }).notNull(),
    targetTime: text("target_time", { length: 8 }).default("23:59:59"),
    type: importantDateTypeEnum("type").default("countdown"),
    priority: priorityEnum("priority").default("medium"),
    color: text("color", { length: 7 }).default("#667eea"),
    icon: text("icon", { length: 50 }).default("calendar"),
    isRecurring: integer("is_recurring").default(0),
    recurringType: recurringTypeEnum("recurring_type"),
    recurringInterval: integer("recurring_interval").default(1),
    notificationDays: text("notification_days"), // JSON字段，建议后续用jsonb
    isActive: integer("is_active").default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 日历事件表（calendar_events）
export const calendarEvents = pgTable("calendar_events", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
    todoId: integer("todo_id").references(() => todos.id, { onDelete: "cascade" }),
    importantDateId: integer("important_date_id").references(() => importantDates.id, { onDelete: "cascade" }),
    title: text("title", { length: 255 }).notNull(),
    description: text("description"),
    startDatetime: timestamp("start_datetime").notNull(),
    endDatetime: timestamp("end_datetime"),
    isAllDay: integer("is_all_day").default(0),
    location: text("location", { length: 255 }),
    color: text("color", { length: 7 }).default("#667eea"),
    type: calendarEventTypeEnum("type").default("event"),
    status: calendarEventStatusEnum("status").default("scheduled"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 用户设置表（user_settings）
export const userSettings = pgTable("user_settings", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique().references(() => users.userId, { onDelete: "cascade" }),
    defaultCalendarView: calendarViewEnum("default_calendar_view").default("month"),
    weekStartDay: integer("week_start_day").default(1),
    defaultEventDuration: integer("default_event_duration").default(60),
    timezone: text("timezone", { length: 50 }).default("Asia/Shanghai"),
    notificationEnabled: integer("notification_enabled").default(1),
    emailNotifications: integer("email_notifications").default(0),
    themeColor: text("theme_color", { length: 7 }).default("#667eea"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
