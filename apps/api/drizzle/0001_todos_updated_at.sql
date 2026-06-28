ALTER TABLE "todos" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
UPDATE "todos" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
