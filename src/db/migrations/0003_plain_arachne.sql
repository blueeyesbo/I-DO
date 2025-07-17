CREATE TYPE "public"."calendar_event_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."calendar_event_type" AS ENUM('todo', 'event', 'reminder', 'deadline');--> statement-breakpoint
CREATE TYPE "public"."default_calendar_view" AS ENUM('month', 'week', 'day');--> statement-breakpoint
CREATE TYPE "public"."important_date_type" AS ENUM('countdown', 'anniversary', 'deadline', 'event');--> statement-breakpoint
CREATE TYPE "public"."recurring_type" AS ENUM('daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"todo_id" integer,
	"important_date_id" integer,
	"title" text NOT NULL,
	"description" text,
	"start_datetime" timestamp NOT NULL,
	"end_datetime" timestamp,
	"is_all_day" integer DEFAULT 0,
	"location" text,
	"color" text DEFAULT '#667eea',
	"type" "calendar_event_type" DEFAULT 'event',
	"status" "calendar_event_status" DEFAULT 'scheduled',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "important_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category_id" integer,
	"title" text NOT NULL,
	"description" text,
	"target_date" timestamp NOT NULL,
	"target_time" text DEFAULT '23:59:59',
	"type" "important_date_type" DEFAULT 'countdown',
	"priority" "priority" DEFAULT 'medium',
	"color" text DEFAULT '#667eea',
	"icon" text DEFAULT 'calendar',
	"is_recurring" integer DEFAULT 0,
	"recurring_type" "recurring_type",
	"recurring_interval" integer DEFAULT 1,
	"notification_days" text,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"todo_id" integer,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"default_calendar_view" "default_calendar_view" DEFAULT 'month',
	"week_start_day" integer DEFAULT 1,
	"default_event_duration" integer DEFAULT 60,
	"timezone" text DEFAULT 'Asia/Shanghai',
	"notification_enabled" integer DEFAULT 1,
	"email_notifications" integer DEFAULT 0,
	"theme_color" text DEFAULT '#667eea',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_todo_id_todos_id_fk" FOREIGN KEY ("todo_id") REFERENCES "public"."todos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_important_date_id_important_dates_id_fk" FOREIGN KEY ("important_date_id") REFERENCES "public"."important_dates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "important_dates" ADD CONSTRAINT "important_dates_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "important_dates" ADD CONSTRAINT "important_dates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_todo_id_todos_id_fk" FOREIGN KEY ("todo_id") REFERENCES "public"."todos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;