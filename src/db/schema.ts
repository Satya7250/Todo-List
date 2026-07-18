import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  clerkId: text("clerk_id").notNull().unique(),

  email: text("email").notNull().unique(),

  name: text("name"),

  imageUrl: text("image_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  name: text("name").notNull(),

  color: text("color").default("#f97316").notNull(),

  icon: text("icon").default("inbox").notNull(),

  isDefault: boolean("is_default").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  projectId: uuid("project_id")
    .references(() => projects.id, {
      onDelete: "cascade",
    })
    .notNull(),

  title: text("title").notNull(),

  description: text("description"),

  completed: boolean("completed").default(false).notNull(),

  priority: integer("priority").default(0).notNull(),

  dueDate: timestamp("due_date"),

  totalTrackedMs: integer("total_tracked_ms").default(0).notNull(),

  isTimerRunning: boolean("is_timer_running").default(false).notNull(),

  timerStartedAt: timestamp("timer_started_at", { mode: "date", withTimezone: true }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  title: text("title").notNull().default("Untitled"),

  content: text("content").notNull().default(""),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});