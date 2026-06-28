import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '../../../..');

dotenv.config({ path: path.resolve(repoRoot, '.env') });

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const migrationsDir = path.resolve(currentDir, '../../drizzle');
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const migrationSql = readFileSync(path.join(migrationsDir, file), 'utf8');
    const statements = migrationSql
      .split('--> statement-breakpoint')
      .map((statement) => statement.trim())
      .filter(Boolean);

    console.log(`Applying ${file}...`);
    for (const statement of statements) {
      await sql.query(statement);
    }
  }

  console.log('Migrations complete.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
