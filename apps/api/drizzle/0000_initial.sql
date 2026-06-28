CREATE TABLE IF NOT EXISTS "todo_lists" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_todo_lists_user_id" ON "todo_lists" ("user_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "captures" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "source" text NOT NULL,
  "transcript" text,
  "media_key" text,
  "media_mime_type" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_captures_user_id" ON "captures" ("user_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "todos" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "list_id" text NOT NULL,
  "title" text NOT NULL,
  "completed" boolean DEFAULT false NOT NULL,
  "source" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "reminder_at" timestamp with time zone,
  "reminder_sent_at" timestamp with time zone,
  "transcript" text,
  "capture_id" uuid,
  CONSTRAINT "todos_list_id_todo_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "todo_lists"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "todos_capture_id_captures_id_fk" FOREIGN KEY ("capture_id") REFERENCES "captures"("id") ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_todos_user_id" ON "todos" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_todos_list_id" ON "todos" ("list_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_todos_sort_order" ON "todos" ("sort_order");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_devices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "platform" text NOT NULL,
  "push_token" text NOT NULL,
  "push_provider" text NOT NULL,
  "device_name" text,
  "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_devices_user_id" ON "user_devices" ("user_id");
