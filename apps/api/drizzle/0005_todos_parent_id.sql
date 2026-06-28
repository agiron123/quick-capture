ALTER TABLE "todos" ADD COLUMN IF NOT EXISTS "parent_id" text REFERENCES "todos"("id") ON DELETE CASCADE;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_todos_parent_id" ON "todos" ("parent_id");
