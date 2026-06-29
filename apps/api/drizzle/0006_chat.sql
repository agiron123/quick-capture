CREATE TABLE IF NOT EXISTS "chat_threads" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_threads_user_id" ON "chat_threads" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_threads_user_updated" ON "chat_threads" ("user_id", "updated_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" text PRIMARY KEY NOT NULL,
  "thread_id" text NOT NULL REFERENCES "chat_threads"("id") ON DELETE CASCADE,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_thread_id" ON "chat_messages" ("thread_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_thread_created" ON "chat_messages" ("thread_id", "created_at");
