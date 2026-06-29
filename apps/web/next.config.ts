import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

// Monorepo: load shared env from repo root (same .env as API / mobile)
loadEnvConfig(repoRoot);

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
