ALTER TABLE "tasks" ADD COLUMN "total_tracked_ms" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "is_timer_running" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "timer_started_at" timestamp with time zone;